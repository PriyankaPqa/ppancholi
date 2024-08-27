import { TasksHistoryPage } from './taskHistory.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskDetailsHistoryButton = 'task-details-history-button',
  taskDetailsEditButton = 'task-details-edit-button',
  taskDetailsTeamAssignedTo = 'task-details-assigned-to',
  taskDetailsActionButton = 'task-details-action-button',
  taskDetailsDueDate = 'task-details-due-date',
  taskDetailsDateAdded = 'task-details-date-added',
  taskDetailsDescription = 'task-details-description',
  backToTaskButton = 'task_details_back_btn',
}

export class PersonalTaskDetailsPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private taskDetailsHistoryButton = { selector: DataTest.taskDetailsHistoryButton };

  private taskDetailsEditButton = { selector: DataTest.taskDetailsEditButton };

  private taskDetailsDueDate = { selector: DataTest.taskDetailsDueDate };

  private taskDetailsDateAdded = { selector: DataTest.taskDetailsDateAdded };

  private taskDetailsTeamAssignedTo = { selector: DataTest.taskDetailsTeamAssignedTo };

  private taskDetailsActionButton = { selector: DataTest.taskDetailsActionButton };

  private taskDetailsDescription = { selector: DataTest.taskDetailsDescription };

  private backToTaskButton = { selector: DataTest.backToTaskButton };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getHistoryButton() {
    return cy.getByDataTest(this.taskDetailsHistoryButton);
  }

  public getTaskDetailsDueDate() {
    return cy.getByDataTest(this.taskDetailsDueDate).getAndTrimText();
  }

  public goToTaskHistory() {
    cy.getByDataTest(this.taskDetailsHistoryButton).click();
    return new TasksHistoryPage();
  }

  public getEditButton() {
    return cy.getByDataTest(this.taskDetailsEditButton);
  }

  public getTaskDetailsDateAdded() {
    return cy.getByDataTest(this.taskDetailsDateAdded).getAndTrimText();
  }

  public getTeamTaskTeamAssignedTo() {
    return cy.getByDataTest(this.taskDetailsTeamAssignedTo).getAndTrimText();
  }

  public getTeamTaskActionButton() {
    return cy.getByDataTest(this.taskDetailsActionButton);
  }

  public getTeamDetailsDescription() {
    return cy.getByDataTest(this.taskDetailsDescription).getAndTrimText();
  }

  public getTeamTaskDateAdded() {
    return cy.getByDataTest(this.taskDetailsDateAdded).getAndTrimText();
  }

  public getBackToTasksButton() {
    return cy.getByDataTest(this.backToTaskButton);
  }
}
