import { TeamTaskDetailsPage } from './teamTaskDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskCategory = 'task-category-team-task',
  taskSubCategory = 'task-sub-category',
  taskDescription = 'task-description_input',
  saveButton = 'save-button',
}

export class EditTeamTaskPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private taskCategory = { selector: DataTest.taskCategory };

  private taskSubCategory = { selector: DataTest.taskSubCategory };

  private taskDescription = { selector: DataTest.taskDescription, type: 'textarea' };

  private buttonSave = { selector: DataTest.saveButton };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getTaskCategoryElement() {
    return cy.getByDataTest(this.taskCategory);
  }

  public getTaskSubCategoryElement() {
    return cy.getByDataTest(this.taskSubCategory);
  }

  public getEditTaskDescriptionElement() {
    return cy.getByDataTest(this.taskDescription);
  }

  public selectTaskCategory(category: string) {
    return cy.selectListElementByValue(DataTest.taskCategory, category);
  }

  public selectTaskSubCategory(subCategory: string) {
    return cy.selectListElementByValue(DataTest.taskSubCategory, subCategory);
  }

  public editTaskDescription(editedText: string) {
    cy.getByDataTest(this.taskDescription).clear();
    cy.getByDataTest(this.taskDescription).type(editedText);
  }

  public saveEditedTeamTask() {
    cy.getByDataTest(this.buttonSave).click();
    return new TeamTaskDetailsPage();
  }
}
