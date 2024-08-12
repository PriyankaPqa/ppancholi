import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskDetailsUrgent = 'task-details-is-urgent',
  statusTag = 'chip-text',
  taskDetailsHistoryButton = 'task-details-history-button',
  taskDetailsEditButton = 'task-details-edit-button',
  taskDetailsTeamTaskCreator = 'task-details-team-task-creator-info',
  taskDetailsTeamAssignedTo = 'task-details-assigned-to',
  taskDetailsActionButton = 'task-details-action-button',
  taskDetailsActionWorkingOnItText = 'task-details-working-on-it',
  taskDetailsActionWorkingOnItToggle = 'task-details-working-on-it-toggle',
  taskDetailsDateAdded = 'task-details-date-added',
  backToTaskButton = 'task_details_back_btn',
  caseFileActivityTab = 'case-file-activity',
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

  private taskDetailsActionWorkingOnItText = { selector: DataTest.taskDetailsActionWorkingOnItText };

  private taskDetailsActionWorkingOnItToggle = { selector: DataTest.taskDetailsActionWorkingOnItToggle, type: 'input' };

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

  public getTeamTaskActionWorkingOnItElement() {
    return cy.getByDataTest(this.taskDetailsActionWorkingOnItText);
  }

  public getTeamTaskActionWorkingOnItToggle() {
    return cy.getByDataTest(this.taskDetailsActionWorkingOnItToggle);
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
