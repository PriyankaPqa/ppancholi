import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';
import { TasksHistoryPage } from './taskHistory.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskDetailsUrgent = 'task-details-is-urgent',
  statusTag = 'chip-text',
  taskDetailsHistoryButton = 'task-details-history-button',
  taskDetailsEditButton = 'task-details-edit-button',
  taskDetailsTeamTaskCreator = 'task-details-team-task-creator-info',
  taskDetailsTeamAssignedTo = 'task-details-assigned-to',
  taskDetailsActionButton = 'task-details-action-button',
  taskDetailsDescription = 'task-details-description',
  taskDetailsActionWorkingOnItText = 'task-details-working-on-it',
  taskDetailsActionWorkingOnItToggle = 'task-details-working-on-it-toggle',
  taskDetailsSubCategory = 'task-details-sub-category',
  taskDetailsDateAdded = 'task-details-date-added',
  backToTaskButton = 'task_details_back_btn',
  caseFileActivityTab = 'case-file-activity',
  taskStatus = 'chip-text',
}

export class TeamTaskDetailsPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private taskDetailsUrgent = { selector: DataTest.taskDetailsUrgent };

  private statusTag = { selector: DataTest.statusTag };

  private taskDetailsHistoryButton = { selector: DataTest.taskDetailsHistoryButton };

  private taskDetailsEditButton = { selector: DataTest.taskDetailsEditButton };

  private taskDetailsTeamTaskCreator = { selector: DataTest.taskDetailsTeamTaskCreator };

  private taskDetailsTeamAssignedTo = { selector: DataTest.taskDetailsTeamAssignedTo };

  private taskDetailsActionButton = { selector: DataTest.taskDetailsActionButton };

  private taskDetailsDescription = { selector: DataTest.taskDetailsDescription };

  private taskDetailsActionWorkingOnItText = { selector: DataTest.taskDetailsActionWorkingOnItText };

  private taskDetailsActionWorkingOnItToggle = { selector: DataTest.taskDetailsActionWorkingOnItToggle, type: 'input' };

  private taskDetailsSubCategory = { selector: DataTest.taskDetailsSubCategory };

  private taskStatus = { selector: DataTest.taskStatus };

  private taskDetailsDateAdded = { selector: DataTest.taskDetailsDateAdded };

  private backToTaskButton = { selector: DataTest.backToTaskButton };

  private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getIsUrgentElement() {
    return cy.getByDataTest(this.taskDetailsUrgent);
  }

  public getStatusTag() {
    return cy.getByDataTest(this.statusTag).getAndTrimText();
  }

  public getHistoryButton() {
    return cy.getByDataTest(this.taskDetailsHistoryButton);
  }

  public goToTaskHistory() {
    cy.getByDataTest(this.taskDetailsHistoryButton).click();
    return new TasksHistoryPage();
  }

  public getEditButton() {
    return cy.getByDataTest(this.taskDetailsEditButton);
  }

  public getTeamTaskCreatorInfo() {
    return cy.getByDataTest(this.taskDetailsTeamTaskCreator).getAndTrimText();
  }

  public getTeamTaskTeamAssignedTo() {
    return cy.getByDataTest(this.taskDetailsTeamAssignedTo).getAndTrimText();
  }

  public getTeamTaskActionButton() {
    return cy.getByDataTest(this.taskDetailsActionButton);
  }

  public getTeamTaskDescriptionElement() {
    return cy.getByDataTest(this.taskDetailsDescription);
  }

  public getTeamTaskActionWorkingOnItElement() {
    return cy.getByDataTest(this.taskDetailsActionWorkingOnItText);
  }

  public getTeamTaskActionWorkingOnItToggle() {
    return cy.getByDataTest(this.taskDetailsActionWorkingOnItToggle);
  }

  public getTeamTaskSubCategoryElement() {
    return cy.getByDataTest(this.taskDetailsSubCategory);
  }

  public getTeamTaskStatusElement() {
    return cy.getByDataTest(this.taskStatus);
  }

  public getTeamTaskDateAdded() {
    return cy.getByDataTest(this.taskDetailsDateAdded).getAndTrimText();
  }

  public getBackToTasksButton() {
    return cy.getByDataTest(this.backToTaskButton);
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    return new CaseFileDetailsPage();
  }
}
