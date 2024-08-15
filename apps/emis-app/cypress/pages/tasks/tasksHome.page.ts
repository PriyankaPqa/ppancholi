import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';
import { CreateTeamTaskPage } from './createTeamTask.page';

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
}
