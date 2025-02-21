import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { mockUpdateHouseholdMemberPhoneNumberRequest } from '@libs/cypress-lib/mocks/household/household';
import { faker } from '@faker-js/faker';
import { createEventAndTeam, creatingDuplicateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { assertUpdatedPotentialDuplicateRecordTabSteps, caseFileDetailsPageAssertionSteps } from './canSteps';
import { ResolvedBy, UpdateDuplicateRecordTo } from '../../../pages/manage-duplicates/manageDuplicates.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
];

const cannotRoles = [
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const rationale = 'Resolved by the system';

// eslint-disable-next-line
describe('[T28772] Potential duplicate can be resolved by updating any of the field: phone number/Address/FN+LN from household profile', { tags: ['@household'] }, () => {
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
            const resultCreateDuplicateHousehold = await creatingDuplicateHousehold(accessTokenL6, this.eventCreated, this.provider);
            const { firstHousehold, duplicateHousehold, createDuplicateHouseholdRequest } = resultCreateDuplicateHousehold;
            cy.wrap(firstHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.firstName).as('originalHouseholdPrimaryBeneficiaryFirstName');
            cy.wrap(firstHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.lastName).as('originalHouseholdPrimaryBeneficiaryLastName');
            cy.wrap(firstHousehold.registrationResponse.caseFile.caseFileNumber).as('originalHouseholdCaseFileNumber');
            cy.wrap(firstHousehold.registrationResponse.household.registrationNumber).as('originalHouseholdRegistrationNumber');
            cy.wrap(firstHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('originalHouseholdPrimaryBeneficiaryPhoneNumber');
            cy.wrap(createDuplicateHouseholdRequest.primaryBeneficiary.identitySet.firstName).as('comparisonHouseholdPrimaryBeneficiaryFirstName');
            cy.wrap(createDuplicateHouseholdRequest.primaryBeneficiary.identitySet.lastName).as('comparisonHouseholdPrimaryBeneficiaryLastName');
            cy.wrap(duplicateHousehold.caseFile.caseFileNumber).as('comparisonHouseholdCaseFileNumber');
            cy.wrap(duplicateHousehold.household.registrationNumber).as('comparisonHouseholdRegistrationNumber');
            cy.wrap(duplicateHousehold.household.members[0]).as('duplicateHouseholdPrimaryBeneficiaryId');
            cy.login(roleName);
            cy.goTo(`casefile/household/${duplicateHousehold.household.id}`);
          });
        });
        it('should be able to resolve potential duplicate by updating phone number field', function () {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getDuplicatesIcon().scrollIntoView();
          householdProfilePage.getDuplicatesIcon().should('be.visible');
          householdProfilePage.getDuplicatesCount().should('eq', '1 potential duplicate(s)');

          cy.then(() => {
            // updates phone number for primary household to resolve the duplication
            const updatedPhoneNumber = faker.phone.number('5143######');
            const mockUpdateHouseholdMemberPhoneNumber = mockUpdateHouseholdMemberPhoneNumberRequest(updatedPhoneNumber);
            this.provider.households.updatePersonContactInformation(this.duplicateHouseholdPrimaryBeneficiaryId, false, mockUpdateHouseholdMemberPhoneNumber);
            householdProfilePage.refreshUntilHouseholdContactInformationUpdated(updatedPhoneNumber);

            if (roleName === UserRoles.level6 || roleName === UserRoles.level5) {
              assertUpdatedPotentialDuplicateRecordTabSteps({
                firstName: this.originalHouseholdPrimaryBeneficiaryFirstName,
                lastName: this.originalHouseholdPrimaryBeneficiaryLastName,
                registrationNumber: this.originalHouseholdRegistrationNumber,
                caseFileNumber: this.originalHouseholdCaseFileNumber,
                eventName: this.eventCreated.name.translation.en,
                phoneNumber: this.originalHouseholdPrimaryBeneficiaryPhoneNumber,
                updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
                resolvedBy: ResolvedBy.System,
                rationale,
              });
            }

            caseFileDetailsPageAssertionSteps({
              registrationNumber: this.originalHouseholdRegistrationNumber,
              updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
              resolvedBy: ResolvedBy.System,
              rationale,
            });

            if (roleName === UserRoles.level6 || roleName === UserRoles.level5) {
              assertUpdatedPotentialDuplicateRecordTabSteps({
                firstName: this.comparisonHouseholdPrimaryBeneficiaryFirstName,
                lastName: this.comparisonHouseholdPrimaryBeneficiaryLastName,
                registrationNumber: this.comparisonHouseholdRegistrationNumber,
                caseFileNumber: this.comparisonHouseholdCaseFileNumber,
                eventName: this.eventCreated.name.translation.en,
                phoneNumber: updatedPhoneNumber,
                updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
                resolvedBy: ResolvedBy.System,
                rationale,
              });
            }

            caseFileDetailsPageAssertionSteps({
              registrationNumber: this.comparisonHouseholdRegistrationNumber,
              updateDuplicateRecordTo: UpdateDuplicateRecordTo.Resolved,
              resolvedBy: ResolvedBy.System,
              rationale,
            });
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
        it('should not be able to update phone number field', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
          householdProfilePage.getEditMemberButtons().should('not.exist');
        });
      });
    }
  });
});
