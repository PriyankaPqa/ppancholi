import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { TasksHistoryPage } from '../../../pages/tasks/taskHistory.page';

export const assertTaskHistorySteps = (roleName: UserRoles, actionTaken: string, index?: number) => {
  const tasksHistoryPage = new TasksHistoryPage();
  tasksHistoryPage.getDialogTitleElement().contains('Task history').should('be.visible');
  tasksHistoryPage.getCloseButton().should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserName(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableEditedByElementByIndex(index).contains(getUserRoleDescription(roleName)).should('be.visible');
  tasksHistoryPage.getHistoryTableActionTakenByIndex(index).should('eq', actionTaken);
  tasksHistoryPage.getHistoryTableDateOfChangeByIndex(index).should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
};
