import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { PotentialDuplicateBasis, potentialDuplicateCreatedSteps } from './canSteps';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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

// eslint-disable-next-line
describe('#TC1870# - Household Profile - Potential duplicate records created when Primary member Name & DOB are updated to match that of another EMIS member', { tags: ['@household'] }, () => {
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
            const resultComparisonHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary).as('originalHouseholdPrimaryBeneficiary');
            cy.wrap(resultOriginalHousehold.registrationResponse.caseFile.caseFileNumber).as('originalHouseholdCaseFileNumber');
            cy.wrap(resultOriginalHousehold.registrationResponse.household.registrationNumber).as('originalHouseholdRegistrationNumber');
            cy.wrap(resultComparisonHousehold.registrationResponse.caseFile.caseFileNumber).as('comparisonHouseholdCaseFileNumber');
            cy.wrap(resultComparisonHousehold.registrationResponse.household.registrationNumber).as('comparisonHouseholdRegistrationNumber');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.registrationResponse.household.id}`);
          });
        });
        it('should flag potential duplicates when crc user updates name and dob to match another household', function () {
          const potentialDuplicateMemberData: IPersonalInfoFields = {
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            dateOfBirth: this.originalHouseholdPrimaryBeneficiary.identitySet.dateOfBirth,
          };
          const householdProfilePage = new HouseholdProfilePage();
          const editHouseholdProfilePage = householdProfilePage.editMemberByIndex(0);
          editHouseholdProfilePage.fill(potentialDuplicateMemberData, '');
          editHouseholdProfilePage.getPersonalInfoDuplicateErrorElement()
            .contains('This individual appears to already exist in the system. Please confirm this individual is not a duplicate before proceeding.')
            .scrollIntoView()
            .should('be.visible');
          editHouseholdProfilePage.saveEdit();

          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.NameAndDob,
            roleName,
            caseFileLogIndex: 1, // change in primary member Name and Dob resets Authentication to failed thereby pushing potential duplicate log on casefile details page to Index = 1
          });

          // checks if Manage Duplicate info is updated for original household
          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            caseFileNumber: this.comparisonHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.NameAndDob,
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
        it('should not be able to flag potential duplicates with crc user not able to update name and dob to match another household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getEditMemberButtons().should('not.exist');
        });
      });
    }
  });
});
