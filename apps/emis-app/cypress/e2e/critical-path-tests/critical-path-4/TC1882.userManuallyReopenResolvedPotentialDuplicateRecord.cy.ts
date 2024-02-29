import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest } from '@libs/cypress-lib/mocks/household/household';
import { IDetailedRegistrationResponse } from '@libs/entities-lib/household';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { createEventAndTeam, IPrepareStateHousehold, prepareStateHousehold, resolvePotenialDuplicateRecord } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { UpdateDuplicateRecordTo } from '../../../pages/manage-duplicates/manageDuplicates.page';
import {
  assertUpdatedPotentialDuplicateRecordTabSteps,
  caseFileDetailsPageAssertionSteps,
  manuallyUpdatePotentialDuplicateRecordStatusSteps,
} from './canSteps';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const rationale = 'I am re-opening this duplicate';

describe('#TC1882# - User can manually re-open a resolved potential duplicate record', { tags: ['@household'] }, () => {
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
          let resultOriginalHousehold: IPrepareStateHousehold;
          let resultComparisonHousehold: IDetailedRegistrationResponse;
          let createDuplicateHousehold: ICreateHouseholdRequest;
          cy.then(async function () {
            resultOriginalHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            createDuplicateHousehold = mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest(
              this.eventCreated.id,
              resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number,
            );
            resultComparisonHousehold = await this.provider.households.postCrcRegistration(createDuplicateHousehold);
          });
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(2000);
          cy.then(async function () {
            await resolvePotenialDuplicateRecord(this.provider, resultComparisonHousehold.caseFile.householdId);
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
        it('should manually re-open a resolved potential duplicate record', function () {
          manuallyUpdatePotentialDuplicateRecordStatusSteps({
            rationale,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Potential,
            dialogUpdateRecordStatusTitle: 'Flag household as potential duplicate',
            dialogFlagAsText: 'Potential duplicate',
            dialogLabelMandatoryText: 'Rationale*',
          });

          assertUpdatedPotentialDuplicateRecordTabSteps({
            firstName: this.originalHouseholdPrimaryBeneficiaryFirstName,
            lastName: this.originalHouseholdPrimaryBeneficiaryLastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            phoneNumber: this.phoneNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Potential,
            rationale,
            roleName,
          });

          caseFileDetailsPageAssertionSteps({
            registrationNumber: this.originalHouseholdRegistrationNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Potential,
            rationale,
            roleName,
          });

          assertUpdatedPotentialDuplicateRecordTabSteps({
            firstName: this.comparisonHouseholdPrimaryBeneficiary.firstName,
            lastName: this.comparisonHouseholdPrimaryBeneficiary.lastName,
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            caseFileNumber: this.comparisonHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            phoneNumber: this.phoneNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Potential,
            rationale,
            roleName,
          });

          caseFileDetailsPageAssertionSteps({
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            updateDuplicateRecordTo: UpdateDuplicateRecordTo.Potential,
            rationale,
            roleName,
          });
        });
      });
    }
  });

  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultOriginalHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        const createDuplicateHousehold = mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest(
          this.eventCreated.id,
          resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number,
        );
        const resultComparisonHousehold = await this.provider.households.postCrcRegistration(createDuplicateHousehold);
        resolvePotenialDuplicateRecord(this.provider, resultComparisonHousehold.caseFile.householdId);
        cy.wrap(resultComparisonHousehold.caseFile.householdId).as('householdId');
      });
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/household/${this.householdId}`);
        });
        it('should not be able to manually re-open a resolved potential duplicate record', () => {
          const householdProfilePage = new HouseholdProfilePage();

          if (roleName === UserRoles.level5) {
            const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
            manageDuplicatesPage.getTabResolved().click();
            manageDuplicatesPage.getDuplicateActionDropdown().should('have.attr', 'disabled').and('contains', 'disabled');
          } else if (roleName === UserRoles.level4 || roleName === UserRoles.level3 || roleName === UserRoles.level2 || roleName === UserRoles.level1) {
            householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
            const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
            manageDuplicatesPage.getTabResolved().should('not.exist');
          } else {
            householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
            householdProfilePage.getManageDuplicatesButton().should('not.exist');
          }
        });
      });
    }
  });
});
