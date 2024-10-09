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
  dialogTitle = 'dialog-title',
  dialogRadioCompleted = 'task-action-dialog-radio-Completed',
  dialogRadioCancelled = 'task-action-dialog-radio-Cancel',
  dialogRadioRationale = 'task-action-dialog-rationale_input',
  applyButton = 'dialog-submit-action',
  status = 'chip-text',
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

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogRadioCompleted = { selector: DataTest.dialogRadioCompleted };

  private dialogRadioCancelled = { selector: DataTest.dialogRadioCancelled };

  private dialogRadioRationale = { selector: DataTest.dialogRadioRationale, type: 'textarea' };

  private applyButton = { selector: DataTest.applyButton };

  private status = { selector: DataTest.status };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getHistoryButton() {
    return cy.getByDataTest(this.taskDetailsHistoryButton);
  }

  public getPersonalTaskDueDate() {
    return cy.getByDataTest(this.taskDetailsDueDate).getAndTrimText();
  }

  public goToTaskHistory() {
    cy.getByDataTest(this.taskDetailsHistoryButton).click();
    return new TasksHistoryPage();
  }

  public getEditButton() {
    return cy.getByDataTest(this.taskDetailsEditButton);
  }

  public getPersonalTaskDateAdded() {
    return cy.getByDataTest(this.taskDetailsDateAdded).getAndTrimText();
  }

  public getPersonalTaskTeamAssignedTo() {
    return cy.getByDataTest(this.taskDetailsTeamAssignedTo).getAndTrimText();
  }

  public getPersonalTaskActionButton() {
    return cy.getByDataTest(this.taskDetailsActionButton);
  }

  public getPersonalTaskDescription() {
    return cy.getByDataTest(this.taskDetailsDescription).getAndTrimText();
  }

  public getBackToTasksButton() {
    return cy.getByDataTest(this.backToTaskButton);
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getCompletedButton() {
    return cy.getByDataTest(this.dialogRadioCompleted);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.dialogRadioCancelled);
  }

  public getRationaleDescription() {
    return cy.getByDataTest(this.dialogRadioRationale);
  }

  public getDialogApplyButton() {
    return cy.getByDataTest(this.applyButton);
  }

  public getPersonalTaskStatus() {
    return cy.getByDataTest(this.status);
  }
}
