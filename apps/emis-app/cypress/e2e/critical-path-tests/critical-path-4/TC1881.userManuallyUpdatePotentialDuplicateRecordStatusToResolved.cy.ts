import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest } from '@libs/cypress-lib/mocks/household/household';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { ResolvedBy, UpdateDuplicateRecordTo } from '../../../pages/manage-duplicates/manageDuplicates.page';
import {
  assertUpdatedPotentialDuplicateRecordTabSteps,
  caseFileDetailsPageAssertionSteps,
  manuallyUpdatePotentialDuplicateRecordStatusSteps,
} from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const rationale = 'I am resolving this duplicate';

describe('#TC1881# - User can manually update the status of a potential duplicate record to Resolved', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
      cy.wrap(resultCreatedEvent.event).as('eventCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultOriginalHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const createDuplicateHousehold = mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest(
              this.eventCreated.id,
              resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number,
            );
            const resultComparisonHousehold = await this.provider.households.postCrcRegistration(createDuplicateHousehold);
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.firstName).as('originalHouseholdPrimaryBeneficiaryFirstName');
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.lastName).as('originalHouseholdPrimaryBeneficiaryLastName');
            cy.wrap(resultOriginalHousehold.registrationResponse.caseFile.caseFileNumber).as('originalHouseholdCaseFileNumber');
            cy.wrap(resultOriginalHousehold.registrationResponse.household.registrationNumber).as('originalHouseholdRegistrationNumber');
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('phoneNumber');
            cy.wrap(createDuplicateHousehold.primaryBeneficiary.identitySet).as('comparisonHouseholdPrimaryBeneficiary');
            cy.wrap(resultComparisonHousehold.caseFile.caseFileNumber).as('comparisonHouseholdCaseFileNumber');
            cy.wrap(resultComparisonHousehold.household.registrationNumber).as('comparisonHouseholdRegistrationNumber');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.caseFile.householdId}`);
          });
        });
        it('should manually update potential duplicate records status to resolved', function () {
          manuallyUpdatePotentialDuplicateRecordStatusSteps({
            rationale,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
            dialogUpdateRecordStatusTitle: 'Flag household duplicate as resolved',
            dialogFlagAsText: 'Resolved duplicate',
            dialogLabelMandatoryText: 'Action taken to resolve*',
          });

          if (roleName === UserRoles.level6 && UserRoles.level5) {
            assertUpdatedPotentialDuplicateRecordTabSteps({
              firstName: this.originalHouseholdPrimaryBeneficiaryFirstName,
              lastName: this.originalHouseholdPrimaryBeneficiaryLastName,
              registrationNumber: this.originalHouseholdRegistrationNumber,
              caseFileNumber: this.originalHouseholdCaseFileNumber,
              eventName: this.eventCreated.name.translation.en,
              phoneNumber: this.phoneNumber,
              updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
              resolvedBy: ResolvedBy.System,
              rationale,
              roleName,
            });
          }

          caseFileDetailsPageAssertionSteps({
            registrationNumber: this.originalHouseholdRegistrationNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
            resolvedBy: ResolvedBy.System,
            rationale,
            roleName,
          });

          if (roleName === UserRoles.level6 && UserRoles.level5) {
            assertUpdatedPotentialDuplicateRecordTabSteps({
              firstName: this.comparisonHouseholdPrimaryBeneficiary.firstName,
              lastName: this.comparisonHouseholdPrimaryBeneficiary.lastName,
              registrationNumber: this.comparisonHouseholdRegistrationNumber,
              caseFileNumber: this.comparisonHouseholdCaseFileNumber,
              eventName: this.eventCreated.name.translation.en,
              phoneNumber: this.phoneNumber,
              updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
              resolvedBy: ResolvedBy.System,
              rationale,
              roleName,
            });
          }

          caseFileDetailsPageAssertionSteps({
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
            resolvedBy: ResolvedBy.System,
            rationale,
            roleName,
          });
        });
      });
    }
  });

  describe('Cannot roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('casefile');
        });
        it('should not be able to manually update potential duplicate records', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
          householdProfilePage.getManageDuplicatesButton().should('not.exist');
        });
      });
    }
  });
});
