import { splitDate } from '@libs/cypress-lib/helpers';
import { PersonalTaskDetailsPage } from './personalTaskDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskCategory = 'task-category-personal-task',
  taskAssignedTo = 'task-assigned-to',
  taskDueDate = 'task-due-date',
  taskDescriptionInput = 'task-description_input',
  taskDescription = 'task-description',
  cancelButton = 'cancel-button',
  createButton = 'save-button',
}

export class CreatePersonalTaskPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private taskDueDate = { selector: DataTest.taskDueDate, type: 'input' };

  private taskDueDateElement = { selector: DataTest.taskDueDate, type: 'span' };

  private taskAssignedTo = { selector: DataTest.taskAssignedTo };

  private taskCategoryInput = { selector: DataTest.taskCategory, type: 'input' };

  private taskCategoryLabel = { selector: DataTest.taskCategory, type: 'span' };

  private taskDescriptionElement = { selector: DataTest.taskDescriptionInput };

  private taskDescriptionInput = { selector: DataTest.taskDescriptionInput, type: 'textarea' };

  private cancelButton = { selector: DataTest.cancelButton };

  private createButton = { selector: DataTest.createButton };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getTaskAssignedTo() {
    return cy.getByDataTest(this.taskAssignedTo).getAndTrimText();
  }

  public enterTaskCategory(category: string) {
    return cy.getByDataTest(this.taskCategoryInput).type(category);
  }

  public getTaskDueDateElement() {
    return cy.getByDataTest(this.taskDueDateElement);
  }

  public getTaskCategoryElement() {
    return cy.getByDataTest(this.taskCategoryLabel);
  }

  public selectDueDate(date: string | Date) {
    const { year, month, day } = splitDate(date.toString());
    return cy.setDatePicker(DataTest.taskDueDate, { year, month, day });
  }

  public getTaskDescriptionElement() {
    return cy.getByDataTest(this.taskDescriptionElement);
  }

  public enterTaskDescription(description: string) {
    return cy.getByDataTest(this.taskDescriptionInput).type(description);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getCreateButton() {
    return cy.getByDataTest(this.createButton);
  }

  public createPersonalTask() {
    cy.getByDataTest(this.createButton).click();
    return new PersonalTaskDetailsPage();
  }
}
