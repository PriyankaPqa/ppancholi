import { splitDate } from '@libs/cypress-lib/helpers';
import { PersonalTaskDetailsPage } from './personalTaskDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  personalTaskStatus = 'task-status-chip',
  personalTaskAssignedTo = 'task-assigned-to',
  taskCategory = 'task-category-personal-task',
  taskDueDate = 'task-due-date',
  taskDescriptionInput = 'task-description_input',
  cancelButton = 'cancel-button',
  saveButton = 'save-button',
}

export class EditPersonalTaskPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private personalTaskStatus = { selector: DataTest.personalTaskStatus };

  private personalTaskAssignedTo = { selector: DataTest.personalTaskAssignedTo };

  private taskCategory = { selector: DataTest.taskCategory, type: 'input' };

  private taskDueDate = { selector: DataTest.taskDueDate, type: 'input' };

  private taskDescriptionInput = { selector: DataTest.taskDescriptionInput, type: 'textarea' };

  private cancelButton = { selector: DataTest.cancelButton };

  private buttonSave = { selector: DataTest.saveButton };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getTaskStatusElement() {
    return cy.getByDataTest(this.personalTaskStatus);
  }

  public getTaskAssignedToElement() {
    return cy.getByDataTest(this.personalTaskAssignedTo);
  }

  public editTaskCategory(category: string) {
    cy.getByDataTest(this.taskCategory).clear();
    return cy.getByDataTest(this.taskCategory).type(category);
  }

  public editTaskDescription(editedText: string) {
    cy.getByDataTest(this.taskDescriptionInput).clear();
    cy.getByDataTest(this.taskDescriptionInput).type(editedText);
  }

  public selectDueDate(date: string | Date) {
    const { year, month, day } = splitDate(date.toString());
    return cy.setDatePicker(DataTest.taskDueDate, { year, month, day });
  }

  public saveEditedPersonalTask() {
    cy.getByDataTest(this.buttonSave).click();
    return new PersonalTaskDetailsPage();
  }
}
