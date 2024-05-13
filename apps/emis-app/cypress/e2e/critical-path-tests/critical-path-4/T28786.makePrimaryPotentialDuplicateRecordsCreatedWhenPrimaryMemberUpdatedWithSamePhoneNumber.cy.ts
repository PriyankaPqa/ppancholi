import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { PotentialDuplicateBasis, makeMemberPrimarySteps, potentialDuplicateCreatedSteps } from './canSteps';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
];

const cannotRoles = [
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

// eslint-disable-next-line
describe('[T28786] Make Primary - Potential duplicate records created when Primary Member Phone number is updated to match that of another EMIS member.', { tags: ['@household'] }, () => {
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
            cy.wrap(resultComparisonHousehold.mockCreateHousehold.additionalMembers[0].identitySet).as('comparisonHouseholdNewPrimaryMember');
            cy.wrap(resultComparisonHousehold.registrationResponse.caseFile.caseFileNumber).as('comparisonHouseholdCaseFileNumber');
            cy.wrap(resultComparisonHousehold.registrationResponse.household.registrationNumber).as('comparisonHouseholdRegistrationNumber');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.registrationResponse.household.id}`);
          });
        });
        it('should create potential duplicate records when crc user makes a member primary with phone number matching another household', function () {
          const potentialDuplicateMemberData: IPersonalInfoFields = {
            phoneNumber: this.originalHouseholdPrimaryBeneficiary.contactInformation.homePhoneNumber.number,
          };

          makeMemberPrimarySteps({
            roleName,
            potentialDuplicateMemberData,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
            makePrimaryMemberFirstName: this.comparisonHouseholdNewPrimaryMember.firstName,
            makePrimaryMemberLastName: this.comparisonHouseholdNewPrimaryMember.lastName,
          });

          // asserts value of original household in duplicate household's Manage Duplicate pop up where we create a new primary member with phone number same as original household
          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            phoneNumber: this.originalHouseholdPrimaryBeneficiary.contactInformation.homePhoneNumber.number,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
            roleName,
          });

          // asserts value of duplicate household primary member in original household's Manage Duplicate pop up
          potentialDuplicateCreatedSteps({
            firstName: this.comparisonHouseholdNewPrimaryMember.firstName,
            lastName: this.comparisonHouseholdNewPrimaryMember.lastName,
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            caseFileNumber: this.comparisonHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            phoneNumber: this.originalHouseholdPrimaryBeneficiary.contactInformation.homePhoneNumber.number,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
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
        it('should not be able to create potential duplicates records with crc user not able to make a member primary with phone number matching another household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getMakeHouseholdPrimaryButtons().should('not.exist');
        });
      });
    }
  });
});
