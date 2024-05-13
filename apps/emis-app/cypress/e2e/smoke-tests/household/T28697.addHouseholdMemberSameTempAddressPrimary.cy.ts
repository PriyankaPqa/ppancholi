import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IEventEntity } from '@libs/entities-lib/event';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { fixtureHouseholdMember } from '../../../fixtures/household';

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

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;
let household = null as ICreateHouseholdRequest;

describe('[T28697] Add Household Member Same Temp Address As Primary', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
      const { provider, team } = result;
      event = result.event;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
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
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            household = result.mockCreateHousehold;
            cy.wrap(household).as('household');
            cy.login(roleName);
            cy.goTo(`casefile/household/${caseFileCreated.householdId}`);
          });
        });
        it('should successfully add household member with same temp address as primary', function () {
          const householdSize = this.household.additionalMembers.length + 1; // 1 primary member + additional household members
          const householdMemberData = fixtureHouseholdMember(this.test.retries.length);

          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdSize().should('be.visible').should('have.length', householdSize);

          const addHouseholdMemberPage = householdProfilePage.addNewMember();
          addHouseholdMemberPage.fill(householdMemberData);
          addHouseholdMemberPage.assignSameTempAddressAsPrimaryMember();
          addHouseholdMemberPage.addHouseholdMember();

          householdProfilePage.getHouseholdSize().should('have.length', householdSize + 1);

          if (roleName === UserRoles.level1 || roleName === UserRoles.level0) {
            householdProfilePage.getMakePrimaryButtons().should('not.exist');
            householdProfilePage.getEditMemberButtons().eq(5).should('exist');
            householdProfilePage.getSplitMemberButtons().should('not.exist');
            householdProfilePage.getDeleteMemberButtonByIndex(4).should('exist');
          } else {
            householdProfilePage.getMakePrimaryButtons().eq(4).should('exist');
            householdProfilePage.getEditMemberButtons().eq(5).should('exist');
            householdProfilePage.getSplitMemberButtons().eq(4).should('exist');
            householdProfilePage.getDeleteMemberButtonByIndex(4).should('exist');
          }

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Household member added');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Modified household information');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Household member added: ${householdMemberData.firstName} ${householdMemberData.lastName}`);
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
        it('should not be able to add household member with same temp address as primary', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold(); // re-using a household created for canRoles.
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getAddNewMemberButton().should('not.exist');
        });
      });
    }
  });
});
