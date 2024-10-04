import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { CaseFileDetailsPage } from 'cypress/pages/casefiles/caseFileDetails.page';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { TasksHistoryPage } from '../../../pages/tasks/taskHistory.page';

export interface AssertTaskHistoryStepsParams {
  roleName: UserRoles,
  actionTaken: string,
  rationale?: string,
  index?: number,
}

export const assertTaskHistorySteps = ({ roleName, actionTaken, rationale = '-', index = 0 }: AssertTaskHistoryStepsParams) => {
  const tasksHistoryPage = new TasksHistoryPage();
  tasksHistoryPage.getDialogTitleElement().contains('Task history').should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserName(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserRoleDescription(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableActionTakenByIndex(index).should('eq', actionTaken);
  tasksHistoryPage.getHistoryTableRationaleByIndex(index).should('eq', rationale);
  tasksHistoryPage.getHistoryTableDateOfChangeByIndex(index).should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
  tasksHistoryPage.getCloseButton().should('be.visible');
};

export const caseFileDetailsSteps = (taskCategory: string, roleName:UserRoles, taskStatus: string) => {
  const caseFileDetailsPage = new CaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`${taskCategory} has been ${taskStatus}`);
  caseFileDetailsPage.getUserName().should('string', getUserName(roleName));
  caseFileDetailsPage.getRoleName().should('string', getUserRoleDescription(roleName));
  caseFileDetailsPage.getCaseFileActivityTitle().should('string', `Task ${taskStatus}`);
  caseFileDetailsPage.getCaseFileActivityBody().should('string', `${taskCategory} has been ${taskStatus}`);
};
