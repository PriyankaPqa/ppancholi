import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { mockUpdateHouseholdMemberFirstNameAndLastNameRequest } from '@libs/cypress-lib/mocks/household/household';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureCreateAddress } from '../../../fixtures/household';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { PotentialDuplicateBasis, splitHouseholdDuplicateHouseholdSteps } from './canSteps';

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
describe('[T28782] Split Household - User cannot split household when Primary Member Phone number updated thereby making Name & Phone number same as another EMIS member.', { tags: ['@household'] }, () => {
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
            resultComparisonHousehold.provider.households.updatePersonIdentity(
              resultComparisonHousehold.registrationResponse.household.members[1],
              false,
              mockUpdateHouseholdMemberFirstNameAndLastNameRequest(
                resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.firstName,
                resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.identitySet.lastName,
              ),
            );
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('originalHouseholdPrimaryBeneficiaryPhoneNumber');
            cy.wrap(resultComparisonHousehold.mockCreateHousehold.additionalMembers[0].identitySet).as('comparisonHouseholdNewPrimaryMember');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.registrationResponse.household.id}`);
          });
        });
        it('should not be able to split household when primary member updated with same name and phone number', function () {
          splitHouseholdDuplicateHouseholdSteps({
            roleName,
            eventName: this.eventCreated.name.translation.en,
            originalHouseholdPrimaryBeneficiary: this.originalHouseholdPrimaryBeneficiary,
            splitMemberHouesholdAddress: fixtureCreateAddress(),
            splitMemberPhoneNumber: this.originalHouseholdPrimaryBeneficiaryPhoneNumber,
            potentialDuplicateBasis: PotentialDuplicateBasis.NameAndDob,
            comparisonHouseholdNewPrimaryMember: this.comparisonHouseholdNewPrimaryMember,
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
        it('should not be able to split a household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getSplitMemberButtons().should('not.exist');
        });
      });
    }
  });
});
