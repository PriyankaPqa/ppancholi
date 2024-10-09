import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { TasksHistoryPage } from '../../../pages/tasks/taskHistory.page';
import { PersonalTaskDetailsPage } from '../../../pages/tasks/personalTaskDetails.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { EditPersonalTaskPage } from '../../../pages/tasks/editPersonalTask.page';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';

export interface AssertTaskHistoryStepsParams {
  roleName: UserRoles,
  actionTaken: string,
  rationale?: string,
  index?: number,
}

const currentDate = formatDateToMmmDdYyyy(format(Date.now(), 'PPp'));

export const assertTaskHistorySteps = ({ roleName, actionTaken, rationale = '-', index = 0 }: AssertTaskHistoryStepsParams) => {
  const tasksHistoryPage = new TasksHistoryPage();
  tasksHistoryPage.getDialogTitleElement().contains('Task history').should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserName(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserRoleDescription(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableActionTakenByIndex(index).should('eq', actionTaken);
  tasksHistoryPage.getHistoryTableRationaleByIndex(index).should('eq', rationale);
  tasksHistoryPage.getHistoryTableDateOfChangeByIndex(index).should('eq', currentDate);
  tasksHistoryPage.getCloseButton().should('be.visible');
};

export const caseFileDetailsSteps = (taskCategory: string, roleName: UserRoles, taskStatus: string) => {
  const caseFileDetailsPage = new CaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`${taskCategory} has been ${taskStatus}`);
  caseFileDetailsPage.getUserName().should('string', getUserName(roleName));
  caseFileDetailsPage.getRoleName().should('string', getUserRoleDescription(roleName));
  caseFileDetailsPage.getCaseFileActivityTitle().should('string', `Task ${taskStatus}`);
  caseFileDetailsPage.getCaseFileActivityBody().should('string', `${taskCategory} has been ${taskStatus}`);
};

export const personalTaskDetailsSteps = (taskCategory: string, taskDescription: string, personalTaskEdited: boolean) => {
  const personalTaskDetailsPage = new PersonalTaskDetailsPage();
  personalTaskDetailsPage.getPageTitleElement().contains('Personal task details').should('be.visible');
  cy.contains(taskCategory).should('be.visible');
  personalTaskDetailsPage.getPersonalTaskTeamAssignedTo().should('eq', 'Me');
  if (personalTaskEdited) {
    personalTaskDetailsPage.getPersonalTaskDueDate().should('eq', '-');
  } else {
    personalTaskDetailsPage.getPersonalTaskDueDate().should('eq', currentDate);
  }
  personalTaskDetailsPage.getPersonalTaskDateAdded().should('eq', currentDate);
  personalTaskDetailsPage.getPersonalTaskDescription().should('eq', taskDescription);
  personalTaskDetailsPage.getHistoryButton().should('be.visible');
  personalTaskDetailsPage.getEditButton().should('be.visible');
  if (personalTaskEdited) {
    personalTaskDetailsPage.getPersonalTaskActionButton().should('not.exist');
  } else {
    personalTaskDetailsPage.getPersonalTaskActionButton().should('be.visible');
  }
  personalTaskDetailsPage.getBackToTasksButton().should('be.visible');
};

export const assertTaskHomeAndGoToEditTaskSteps = (personalTaskId: string) => {
  const tasksHomePage = new TasksHomePage();
  tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
  cy.contains('Refresh').should('be.visible');
  tasksHomePage.getEditPersonalTaskButtonById(personalTaskId).should('be.visible');
  tasksHomePage.goToEditPersonalTaskPageById(personalTaskId);
};

export const editPersonalTaskSteps = (taskCategory: string, taskDescription: string) => {
  const editPersonalTaskPage = new EditPersonalTaskPage();
  editPersonalTaskPage.getPageTitleElement().contains('Edit personal task').should('be.visible');
  editPersonalTaskPage.editTaskCategory(taskCategory);
  editPersonalTaskPage.editTaskDescription(taskDescription);
  editPersonalTaskPage.selectDueDate(currentDate);
  editPersonalTaskPage.saveEditedPersonalTask();
  cy.contains('The task has been successfully edited.').should('be.visible');
};
