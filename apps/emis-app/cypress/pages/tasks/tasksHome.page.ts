import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';
import { CreatePersonalTaskPage } from './createPersonalTask.page';
import { CreateTeamTaskPage } from './createTeamTask.page';
import { EditTeamTaskPage } from './editTeamTask.page';
import { PersonalTaskDetailsPage } from './personalTaskDetails.page';
import { TeamTaskDetailsPage } from './teamTaskDetails.page';

export enum DataTest {
  tableTitle = 'table_title',
  createTask = 'task-table-create-task-button',
  createNewTeamTask = 'create-team-task-link',
  createNewPersonalTask = 'create-personal-task-link',
  createdTaskCategory = 'task-table-task-category',
  createdTaskAssignedTo = 'task-table-task-assign-to',
  createdTaskStatus = 'task-table-task-status',
  createdTaskCategoryActionButton = 'task-table-action-btn',
  createdTaskCategoryEditButton = 'task-table-edit-btn',
  caseFileActivityTab = 'case-file-activity',
  taskCategoryIcon = 'task-category-icon',
  createdTaskSubCategory = 'task-table-task-sub-category',
  createdTaskUserWorkingOn = 'task-table-user-working-on',
  createdTaskDateAdded = 'task-table-date-added',
  dialogTitle = 'dialog-title',
  dialogTeamTaskInfo = 'task-action-dialog-team-task-info',
  dialogTeamTaskSubCategory = 'task-action-dialog-sub-category',
  dialogTeamTaskDescription = 'task-action-dialog-description',
  dialogRadioAssign = 'task-action-dialog-radio-Assign',
  dialogTeamToAssign = 'task-action-dialog-team-assign-to',
  dialogRadioTaskCompleted = '"task-action-dialog-radio-Task completed"',
  dialogRadioActionCompleted = '"task-action-dialog-radio-Action completed"',
  dialogRadioCompleted = 'task-action-dialog-radio-Completed',
  dialogRadioCancel = 'task-action-dialog-radio-Cancel',
  dialogRadioLabelCompleted = 'task-action-dialog-radio-label-Completed',
  dialogRadioLabelCancel = 'task-action-dialog-radio-label-Cancel',
  dialogRadioDescriptionCancel = 'task-action-dialog-radio-description-Cancel',
  dialogRationale = 'task-action-dialog-rationale',
  dialogRationaleInput = 'task-action-dialog-rationale_input',
  dialogSubmitButton = 'dialog-submit-action',
  dialogCancelButton = 'dialog-cancel-action',
}

export class TasksHomePage {
  private createTask = { selector: DataTest.createTask, type: 'button' };

  private tableTitle = { selector: DataTest.tableTitle };

  private createNewTeamTask = { selector: DataTest.createNewTeamTask };

  private createNewPersonalTask = { selector: DataTest.createNewPersonalTask };

  private createdTaskCategory = { selector: DataTest.createdTaskCategory };

  private createdTaskAssignedTo = { selector: DataTest.createdTaskAssignedTo };

  private createdTaskStatus = { selector: DataTest.createdTaskStatus };

  private createdTaskCategoryActionButton = { selector: DataTest.createdTaskCategoryActionButton };

  private createdTaskCategoryEditButton = { selector: DataTest.createdTaskCategoryEditButton };

  private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

  private taskCategoryIcon = { selector: DataTest.taskCategoryIcon };

  private createdTaskSubCategory = { selector: DataTest.createdTaskSubCategory };

  private createdTaskUserWorkingOn = { selector: DataTest.createdTaskUserWorkingOn };

  private createdTaskDateAdded = { selector: DataTest.createdTaskDateAdded };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogTeamTaskInfo = { selector: DataTest.dialogTeamTaskInfo };

  private dialogTeamTaskSubCategory = { selector: DataTest.dialogTeamTaskSubCategory };

  private dialogTeamTaskDescription = { selector: DataTest.dialogTeamTaskDescription };

  private dialogRadioAssign = { selector: DataTest.dialogRadioAssign, type: 'input' };

  private dialogTeamToAssign = { selector: DataTest.dialogTeamToAssign };

  private dialogRadioTaskCompleted = { selector: DataTest.dialogRadioTaskCompleted, type: 'input' };

  private dialogRadioActionCompleted = { selector: DataTest.dialogRadioActionCompleted, type: 'input' };

  private dialogRadioCompleted = { selector: DataTest.dialogRadioCompleted, type: 'input' };

  private dialogRadioCancel = { selector: DataTest.dialogRadioCancel, type: 'input' };

  private dialogRadioLabelCompleted = { selector: DataTest.dialogRadioLabelCompleted };

  private dialogRadioLabelCancel = { selector: DataTest.dialogRadioLabelCancel };

  private dialogRadioDescriptionCancel = { selector: DataTest.dialogRadioDescriptionCancel };

  private dialogRationale = { selector: DataTest.dialogRationale };

  private dialogRationaleInput = { selector: DataTest.dialogRationaleInput, type: 'textarea' };

  private dialogSubmitButton = { selector: DataTest.dialogSubmitButton };

  private dialogCancelButton = { selector: DataTest.dialogCancelButton };

  public getTableTitleElement() {
    return cy.getByDataTest(this.tableTitle);
  }

  public getCreateTaskButton() {
    return cy.getByDataTest(this.createTask);
  }

  public getCreateNewTeamTaskOption() {
    return cy.getByDataTest(this.createNewTeamTask);
  }

  public addNewTeamTask() {
    cy.getByDataTest(this.createNewTeamTask).click();
    return new CreateTeamTaskPage();
  }

  public getCreateNewPersonalTaskOption() {
    return cy.getByDataTest(this.createNewPersonalTask);
  }

  public getCreatedTaskCategory() {
    return cy.getByDataTestLike(this.createdTaskCategory).getAndTrimText();
  }

  public getCreatedTaskAssignedTo() {
    return cy.getByDataTest(this.createdTaskAssignedTo).getAndTrimText();
  }

  public getCreatedTaskAssignedToElement() {
    return cy.getByDataTest(this.createdTaskAssignedTo);
  }

  public verifyCreatedTaskAssignedTeamName(teamName: string) {
    return cy.getByDataTest(this.createdTaskAssignedTo).contains(teamName).should('be.visible');
  }

  public getCreatedTaskStatusElement() {
    return cy.getByDataTest(this.createdTaskStatus);
  }

  public getCreatedTaskActionButton() {
    return cy.getByDataTestLike(this.createdTaskCategoryActionButton);
  }

  public getCreatedTaskEditButton() {
    return cy.getByDataTestLike(this.createdTaskCategoryEditButton);
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    return new CaseFileDetailsPage();
  }

  public addNewPersonalTask() {
    cy.getByDataTest(this.createNewPersonalTask).click();
    return new CreatePersonalTaskPage();
  }

  public getTaskCategoryIconElement() {
    return cy.getByDataTest(this.taskCategoryIcon);
  }

  public getCreatedTaskSubCategory() {
    return cy.getByDataTest(this.createdTaskSubCategory).getAndTrimText();
  }

  public getCreatedTaskUserWorkingOn() {
    return cy.getByDataTest(this.createdTaskUserWorkingOn).getAndTrimText();
  }

  public verifyTaskTableUserWorkingOn(userName: string) {
    return cy.getByDataTest(this.createdTaskUserWorkingOn).contains(userName).should('be.visible');
  }

  public getCreatedTaskUserWorkingOnElement() {
    return cy.getByDataTest(this.createdTaskUserWorkingOn);
  }

  public getCreatedTaskDateAdded() {
    return cy.getByDataTest(this.createdTaskDateAdded).getAndTrimText();
  }

  public goToTaskActionById(taskId: string) {
    cy.getByDataTest({ selector: `${DataTest.createdTaskCategoryActionButton}-${taskId}` }).click();
  }

  public getTaskActionButtonById(taskId: string) {
    return cy.getByDataTest({ selector: `${DataTest.createdTaskCategoryActionButton}-${taskId}` });
  }

  public goToEditTeamTaskPageById(taskId: string) {
    cy.getByDataTest({ selector: `${DataTest.createdTaskCategoryEditButton}-${taskId}` }).click();
    return new EditTeamTaskPage();
  }

  public getEditTeamTaskButtonById(taskId: string) {
    return cy.getByDataTest({ selector: `${DataTest.createdTaskCategoryEditButton}-${taskId}` });
  }

  public goToPersonalTaskById(taskId: string) {
    cy.getByDataTest({ selector: `${DataTest.createdTaskCategory}-${taskId}` }).click();
    return new PersonalTaskDetailsPage();
  }

  public goToTeamTaskById(taskId: string) {
    cy.getByDataTest({ selector: `${DataTest.createdTaskCategory}-${taskId}` }).click();
    return new TeamTaskDetailsPage();
  }

  public getTaskById(taskId: string) {
    return cy.getByDataTest({ selector: `${DataTest.createdTaskCategory}-${taskId}` });
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getDialogTeamTaskSubCategoryElement() {
    return cy.getByDataTest(this.dialogTeamTaskSubCategory);
  }

  public getDialogTeamTaskDescriptionElement() {
    return cy.getByDataTest(this.dialogTeamTaskDescription);
  }

  public getDialogTeamTaskInfoElement() {
    return cy.getByDataTest(this.dialogTeamTaskInfo);
  }

  public getDialogAssignCheckbox() {
    return cy.getByDataTest(this.dialogRadioAssign);
  }

  public getDialogActionCompletedCheckbox() {
    return cy.getByDataTest(this.dialogRadioActionCompleted);
  }

  public getDialogTaskCompletedCheckbox() {
    return cy.getByDataTest(this.dialogRadioTaskCompleted);
  }

  public getDialogCompletedCheckbox() {
    return cy.getByDataTest(this.dialogRadioCompleted);
  }

  public getDialogCancelledCheckbox() {
    return cy.getByDataTest(this.dialogRadioCancel);
  }

  public getDialogSelectTeamToAssignElement() {
    return cy.getByDataTest(this.dialogTeamToAssign);
  }

  public selectTeamToAssign(teamName: string) {
    return cy.selectListElementByValue(DataTest.dialogTeamToAssign, teamName);
  }

  public cancelTask() {
    return cy.getByDataTest(this.dialogRadioCancel).check({ force: true });
  }

  public getDialogCompletedCheckboxLabel() {
    return cy.getByDataTest(this.dialogRadioLabelCompleted).getAndTrimText();
  }

  public getDialogCancelledCheckboxLabel() {
    return cy.getByDataTest(this.dialogRadioLabelCancel).getAndTrimText();
  }

  public getDialogCancelledCheckboxDescription() {
    return cy.getByDataTest(this.dialogRadioDescriptionCancel).getAndTrimText();
  }

  public getDialogRationaleElement() {
    return cy.getByDataTest(this.dialogRationale);
  }

  public getDialogRationaleInput() {
    return cy.getByDataTest(this.dialogRationaleInput);
  }

  public enterRationale(rationale: string) {
    return cy.getByDataTest(this.dialogRationaleInput).type(rationale);
  }

  public getDialogApplyButton() {
    return cy.getByDataTest(this.dialogSubmitButton);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.dialogCancelButton);
  }
}
