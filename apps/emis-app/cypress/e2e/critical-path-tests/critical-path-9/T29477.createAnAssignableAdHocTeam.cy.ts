import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { generateRandomTeamName } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { TeamsHomePage } from '../../../pages/teams/teamsHome.page';
import { verifyAndReturnCreateNewTeamPage } from '../../helpers/page';

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

describe('[T29477] Create an assignable ad hoc team.', { tags: ['@teams', '@tasks'] }, () => {
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

        it('should create an assignable ad hoc team successfully.', function () {
          const teamsHomePage = new TeamsHomePage();
          teamsHomePage.getCreateTeamButton().click();
          teamsHomePage.getCreateAdHocTeam().should('be.visible');
          teamsHomePage.getCreateStandardTeam().should('be.visible');
          teamsHomePage.goToCreateAdHocTeamPage();
          const createAdHocTeamPage = verifyAndReturnCreateNewTeamPage();
          createAdHocTeamPage.getTeamIsEscalationCheckbox().should('not.be.checked');
          createAdHocTeamPage.getTeamIsAssignableCheckbox().should('not.be.checked');
          createAdHocTeamPage.getTeamName().getAndTrimText().should('string', 'Team name*');
          createAdHocTeamPage.getEventName().getAndTrimText().should('string', 'Event*');
          createAdHocTeamPage.getPrimaryContact().getAndTrimText().should('string', 'Primary contact*');
          createAdHocTeamPage.getTeamCreateButton().should('be.enabled');
          createAdHocTeamPage.getCancelButton().should('be.enabled');
          createAdHocTeamPage.getAddNewMemberButton().should('be.disabled');
          createAdHocTeamPage.getTeamIsAssignableCheckbox().check({ force: true });
          createAdHocTeamPage.getTeamIsEscalationCheckbox().should('not.be.checked');
          createAdHocTeamPage.fillEventName(this.eventCreated.name.translation.en);
          createAdHocTeamPage.fillTeamName(`${generateRandomTeamName()} - retries${this.test.retries.length}`);
          createAdHocTeamPage.fillPrimaryContactName(getUserName(`${roleName}`));
          createAdHocTeamPage.createTeam();
          cy.contains('The ad hoc team has been successfully created.').should('be.visible');
          createAdHocTeamPage.getTeamIsEscalationCheckbox().should('not.be.checked');
          createAdHocTeamPage.getTeamIsAssignableCheckbox().should('be.checked');
          createAdHocTeamPage.getMemberName().should('eq', getUserName(`${roleName}`));
          createAdHocTeamPage.getMemberRole().should('eq', getUserRoleDescription(`${roleName}`));
          createAdHocTeamPage.getMemberTeamCount().should('be.visible');
          createAdHocTeamPage.getMemberCaseFileCount().should('be.visible');
          createAdHocTeamPage.getMemberOpenCaseFileCount().should('be.visible');
          createAdHocTeamPage.getMemberInactiveCaseFileCount().should('be.visible');
          createAdHocTeamPage.getMemberEmailAddress().should('be.visible');
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
