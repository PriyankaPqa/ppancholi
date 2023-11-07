import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { generateRandomTeamName } from '@libs/cypress-lib/helpers';
import { CreateNewTeamPage } from '../../../pages/teams/createNewTeam.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { TeamsHomePage } from '../../../pages/teams/teamsHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const partialRoles = [
  UserRoles.level4,
  UserRoles.level3,
];

const cannotRoles = [
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

const allRolesWithPartial = [...Object.values(allRoles), ...Object.values(partialRoles)] as UserRoles[];

describe('#TC400# - Create Standard Team', { tags: ['@case-file', '@teams'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRolesWithPartial);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
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
          cy.login(roleName);
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
    for (const roleName of partialRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
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
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('teams');
        });
        it('should not be able to create team and have no access to team page', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
