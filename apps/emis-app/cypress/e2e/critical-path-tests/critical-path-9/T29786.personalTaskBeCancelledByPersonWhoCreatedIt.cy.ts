import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { createEventAndTeam, createHousehold, createPersonalTask } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { assertTaskHistorySteps } from './canSteps';
import { useProvider } from '../../../provider/provider';

const canRoles = [
  UserRoles.level6,
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

const { filteredCanRoles, allRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T29786] Personal task can be cancelled by the person who created It', { tags: ['@tasks'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventAndTeam(accessTokenL6, allRoles);
            const resultCreateHousehold = await createHousehold(provider, event);
            const caseFileId = resultCreateHousehold.registrationResponse.caseFile.id;
            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultPersonalTaskCreated = await createPersonalTask(provider, caseFileId);
              cy.wrap(resultPersonalTaskCreated.id).as('taskId');
            });
            cy.wrap(provider).as('provider');
            cy.wrap(event).as('eventCreated');
            cy.wrap(team).as('teamCreated');
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
          });
        });

        after(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should be able to cancel personal task', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getCreatedTaskActionButtonById(this.taskId);
          tasksHomePage.getDialogTitleElement().contains('Task action').should('be.visible');
          tasksHomePage.getDialogCompletedCheckbox().should('not.be.checked');
          tasksHomePage.getDialogCancelledCheckbox().should('not.be.checked');
          tasksHomePage.getDialogCompletedCheckboxLabel().should('eq', 'Completed');
          tasksHomePage.getDialogCancelledCheckboxLabel().should('eq', 'Cancel');
          tasksHomePage.getDialogCancelledCheckboxDescription().should('eq', 'Cancel the task even if not all actions are completed');
          tasksHomePage.getDialogRationaleElement().should('have.attr', 'label').and('contains', '*');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');
          tasksHomePage.cancelTask();
          tasksHomePage.enterRationale('Test rationale - Personal task cancelled');
          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogTitleElement().should('not.exist');
          tasksHomePage.getCreatedTaskStatusElement().contains('Cancelled').should('be.visible');

          const personalTaskDetailsPage = tasksHomePage.getPersonalTaskById(this.taskId);
          personalTaskDetailsPage.getPageTitleElement().contains('Personal task details').should('be.visible');

          const tasksHistoryPage = personalTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps(roleName, 'Task cancelled', 1);
          tasksHistoryPage.getHistoryTableRationaleByIndex(1).should('eq', 'Test rationale - Personal task cancelled');
          tasksHistoryPage.getCloseButton().click();
          tasksHistoryPage.getCloseButton().should('not.exist');

          personalTaskDetailsPage.getPageTitleElement().contains('Personal task details').should('be.visible');
        });
      });
    }
  });
});
