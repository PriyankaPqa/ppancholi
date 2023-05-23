import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { generateRandomTeamName } from '@libs/cypress-lib/helpers';
import { CreateNewTeamPage } from '../../../pages/teams/createNewTeam.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { TeamsHomePage } from '../../../pages/teams/teamsHome.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
};

const partialRoles = {
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
};

const cannotRoles = {
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(partialRoles), ...Object.values(cannotRoles)] as UserRoles[];

const title = '#TC400# - Create Standard Team';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRolesValues);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('teams/create/standard');
        });
        it('should successfully create standard team', function () {
          const createNewTeamPage = new CreateNewTeamPage();

          createNewTeamPage.fillTeamName(`${generateRandomTeamName()} - retries${this.test.retries.length}`);
          createNewTeamPage.fillPrimaryContactName(getUserName(`${roleName}`));
          createNewTeamPage.fillEventName(this.eventCreated.name.translation.en);
          createNewTeamPage.createTeam();
          cy.contains('The standard team has been successfully created.').should('be.visible');
          createNewTeamPage.getMemberName().should('eq', getUserName(`${roleName}`));
          createNewTeamPage.getMemberRole().should('eq', getUserRoleDescription(`${roleName}`));
          createNewTeamPage.getMemberTeamCount().should('be.visible'); // calculating count values is avoided to prevent test flakiness and reduce complexity.
          createNewTeamPage.getMemberCaseFileCount().should('be.visible');
          createNewTeamPage.getMemberOpenCaseFileCount().should('be.visible');
          createNewTeamPage.getMemberInactiveCaseFileCount().should('be.visible');
        });
      });
    }
  });

  describe('Partial Roles', () => {
    for (const [roleName, roleValue] of Object.entries(partialRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('teams');
        });
        it('should not be able to create team but have access till team page only', () => {
          const teamsHomePage = new TeamsHomePage();

          teamsHomePage.getCreateTeamButton().should('not.exist');
          teamsHomePage.getTeams().should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('teams');
        });
        it('should not be able to create team and have no access to team page', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
