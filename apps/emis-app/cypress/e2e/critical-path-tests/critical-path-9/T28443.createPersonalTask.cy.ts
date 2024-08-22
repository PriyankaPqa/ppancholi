import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { createEventAndTeam, createHousehold } from '../../helpers/prepareState';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { assertTaskHistorySteps } from './canSteps';

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

describe('[T28443] Create a Personal Task', { tags: ['@teams', '@tasks'] }, () => {
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
            const resultCreateHousehold = await createHousehold(provider, event);
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/task`);
          });
        });

        afterEach(function () {
          if (this.provider && this.assignableTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should create a personal task successfully.', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          tasksHomePage.getCreateTaskButton().should('be.visible');
          tasksHomePage.getCreateTaskButton().click();
          tasksHomePage.getCreateNewTeamTaskOption().should('be.visible');
          tasksHomePage.getCreateNewPersonalTaskOption().should('be.visible');

          const createPersonalTaskPage = tasksHomePage.addNewPersonalTask();
          createPersonalTaskPage.getTaskAssignedTo().should('eq', 'Me');
          createPersonalTaskPage.getTaskCategoryElement().should('have.attr', 'label').and('contains', '*');
          createPersonalTaskPage.getTaskCategoryElement().should('be.visible');
          createPersonalTaskPage.getTaskDueDateElement().should('have.attr', 'label').and('contains', '*');
          createPersonalTaskPage.getTaskDueDateElement().should('be.visible');
          createPersonalTaskPage.getTaskDescriptionElement().should('be.visible');
          createPersonalTaskPage.getCancelButton().should('be.visible');
          createPersonalTaskPage.getCreateButton().should('be.visible');
          createPersonalTaskPage.enterTaskCategory('Personal Task 1');
          createPersonalTaskPage.selectDueDate(format(Date.now(), 'PPp'));
          createPersonalTaskPage.enterTaskDescription('Test Description 1');
          const personalTaskDetailsPage = createPersonalTaskPage.createPersonalTask();
          cy.contains('The personal task has been successfully created.').should('be.visible');

          personalTaskDetailsPage.getPageTitleElement().contains('Personal task details').should('be.visible');
          cy.contains('Personal Task 1').should('be.visible');
          personalTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', 'Me');
          personalTaskDetailsPage.getTaskDetailsDueDate().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          personalTaskDetailsPage.getTaskDetailsDateAdded().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          personalTaskDetailsPage.getTeamDetailsDescription().should('eq', 'Test Description 1');
          personalTaskDetailsPage.getHistoryButton().should('be.visible');
          personalTaskDetailsPage.getEditButton().should('be.visible');
          personalTaskDetailsPage.getTeamTaskActionButton().should('be.visible');
          personalTaskDetailsPage.getBackToTasksButton().should('be.visible');

          const tasksHistoryPage = personalTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps(roleName);
          tasksHistoryPage.getCloseButton().click();

          personalTaskDetailsPage.getBackToTasksButton().should('be.visible');
          personalTaskDetailsPage.getBackToTasksButton().click();

          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskCategoryIconElement().should('have.attr', 'class').and('contains', 'mdi-account-check');
          tasksHomePage.getCreatedTaskCategory().should('eq', 'Personal Task 1');
          tasksHomePage.getCreatedTaskSubCategory().should('eq', '');
          tasksHomePage.getCreatedTaskAssignedTo().should('eq', '');
          tasksHomePage.getCreatedTaskUserWorkingOn().should('eq', 'N/A');
          tasksHomePage.getCreatedTaskDateAdded().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          tasksHomePage.getCreatedTaskActionButton().should('be.visible');
          tasksHomePage.getCreatedTaskEditButton().should('be.visible');
        });
      });
    }
  });
});
