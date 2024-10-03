import { TeamTaskDetailsPage } from './teamTaskDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  isUrgent = 'is-urgent-check-box',
  taskAssignedTo = 'task-assigned-to',
  taskCategory = 'task-category-team-task',
  faPayment = 'create-edit-task-FA-select',
  taskDescription = 'task-description_input',
  cancelButton = 'cancel-button',
  createButton = 'save-button',
  taskSubCategory = 'task-sub-category',
}

export class CreateTeamTaskPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private isUrgent = { selector: DataTest.isUrgent, type: 'input' };

  private taskAssignedTo = { selector: DataTest.taskAssignedTo };

  private taskCategory = { selector: DataTest.taskCategory };

  private taskSubCategory = { selector: DataTest.taskSubCategory };

  private faPayment = { selector: DataTest.faPayment };

  private taskDescription = { selector: DataTest.taskDescription, type: 'textarea' };

  private cancelButton = { selector: DataTest.cancelButton };

  private createButton = { selector: DataTest.createButton };

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getIsUrgentCheckbox() {
    return cy.getByDataTest(this.isUrgent);
  }

  public getTaskCategoryDropdown() {
    return cy.getByDataTest(this.taskCategory);
  }

  public getTaskSubCategoryDropdown() {
    return cy.getByDataTest(this.taskSubCategory);
  }

  public getFaPaymentDropdown() {
    return cy.getByDataTest(this.faPayment);
  }

  public selectTaskCategory(category: string) {
    return cy.selectListElementByValue(DataTest.taskCategory, category);
  }

  public selectTaskSubCategory(subCategory: string) {
    return cy.selectListElementByValue(DataTest.taskSubCategory, subCategory);
  }

  public selectFaPayment(faPayment: string) {
    return cy.selectListElementByValue(DataTest.faPayment, faPayment);
  }

  public getFaPaymentDropdownElement(faPayment: string) {
    cy.getByDataTest(this.faPayment).click();
    return cy.getByDataTest({ selector: `${DataTest.faPayment}__item--${faPayment.replace(/\s/g, '')}`, type: 'div' });
  }

  public getEscalationTeamAssigned() {
    return cy.getByDataTest(this.taskAssignedTo);
  }

  public getTaskDescriptionElement() {
    return cy.getByDataTest(this.taskDescription);
  }

  public enterTaskDescription(description: string) {
    return cy.getByDataTest(this.taskDescription).type(description);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getCreateButton() {
    return cy.getByDataTest(this.createButton);
  }

  public createTeamTask() {
    cy.getByDataTest(this.createButton).click();
    return new TeamTaskDetailsPage();
  }
}
