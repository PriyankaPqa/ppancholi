import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { generateRandomTeamName } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam } from '../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../helpers/teams';
import { TeamsHomePage } from '../../pages/teams/teamsHome.page';
import { verifyAndReturnCreateNewTeamPage } from '../helpers/page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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

describe('[T29496] Create an assignable standard team.', { tags: ['@teams', '@tasks'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventAndTeam(accessTokenL6, allRoles);
            cy.wrap(provider).as('provider');
            cy.wrap(event).as('eventCreated');
            cy.wrap(team).as('teamCreated');
            cy.login(roleName);
            cy.goTo('teams');
          });
        });

        after(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should create an assignable standard team successfully.', function () {
          const teamsHomePage = new TeamsHomePage();
          teamsHomePage.getCreateTeamButton().click();
          teamsHomePage.getCreateAdHocTeam().should('be.visible');
          teamsHomePage.getCreateStandardTeam().should('be.visible');
          teamsHomePage.goToCreateStandardTeamPage();
          const createStandardTeamPage = verifyAndReturnCreateNewTeamPage();
          createStandardTeamPage.getTeamIsAssignableCheckbox().should('not.be.checked');
          createStandardTeamPage.getTeamName().getAndTrimText().should('string', 'Team name*');
          createStandardTeamPage.getEventName().getAndTrimText().should('string', 'Event');
          createStandardTeamPage.getPrimaryContact().getAndTrimText().should('string', 'Primary contact*');
          createStandardTeamPage.getTeamCreateButton().should('be.enabled');
          createStandardTeamPage.getCancelButton().should('be.enabled');
          createStandardTeamPage.getAddNewMemberButton().should('be.disabled');
          createStandardTeamPage.getTeamIsAssignableCheckbox().check({ force: true });
          createStandardTeamPage.fillEventName(this.eventCreated.name.translation.en);
          createStandardTeamPage.fillTeamName(`${generateRandomTeamName()} - retries${this.test.retries.length}`);
          createStandardTeamPage.fillPrimaryContactName(getUserName(`${roleName}`));
          createStandardTeamPage.createTeam();
          cy.contains('The standard team has been successfully created.').should('be.visible');
          createStandardTeamPage.getTeamIsAssignableCheckbox().should('be.checked');
          createStandardTeamPage.getMemberName().should('eq', getUserName(`${roleName}`));
          createStandardTeamPage.getMemberRole().should('eq', getUserRoleDescription(`${roleName}`));
          createStandardTeamPage.getMemberTeamCount().should('be.visible');
          createStandardTeamPage.getMemberCaseFileCount().should('be.visible');
          createStandardTeamPage.getMemberOpenCaseFileCount().should('be.visible');
          createStandardTeamPage.getMemberInactiveCaseFileCount().should('be.visible');
          createStandardTeamPage.getMemberEmailAddress().should('be.visible');
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
        it('should not be able to create a team', () => {
          const teamsHomePage = new TeamsHomePage();
          teamsHomePage.getCreateTeamButton().should('not.exist');
        });
      });
    }
  });
});
