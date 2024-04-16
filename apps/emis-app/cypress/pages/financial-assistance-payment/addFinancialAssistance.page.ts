import { AddNewPaymentLinePage } from './addNewPaymentLine.page';

export enum DataTest {
  tableSelect = 'financialCreate_tableSelect',
  description = 'financial_description',
  addPaymentLineBtn = 'financial-addPaymentLineBtn',
  create = 'save',
  paymentLineGroupTitle = 'paymentLineGroup__title',
  paymentLineItemTitle = 'paymentLineItem__title',
  itemEditButton = 'paymentLineItem__editBtn',
  itemDeleteButton = 'paymentLineItem__deleteBtn',
  submitAssistanceButton = 'submit',
  paymentStatus = 'chip-text',
  paymentEdit = 'edit-link',
  paymentDelete = 'delete-link',
  backToFinancialAssistance = 'cancel',
  relatedNumber = 'paymentLineItem__related-number',
  paymentLineGroupStatus = 'paymentLineGroup__statusMessage',
  title = 'page-title',
}

export class AddFinancialAssistancePage {
  private description = { selector: DataTest.description, type: 'textarea' };

  private addPaymentLineButton = { selector: DataTest.addPaymentLineBtn };

  private createButton = { selector: DataTest.create };

  private tableSelect = { selector: DataTest.tableSelect };

  private paymentLineGroupTitle = { selector: DataTest.paymentLineGroupTitle };

  private paymentLineItemTitle = { selector: DataTest.paymentLineItemTitle };

  private itemEditButton = { selector: DataTest.itemEditButton };

  private itemDeleteButton = { selector: DataTest.itemDeleteButton };

  private submitAssistanceButton = { selector: DataTest.submitAssistanceButton };

  private paymentStatus = { selector: DataTest.paymentStatus };

  private paymentEdit = { selector: DataTest.paymentEdit };

  private paymentDelete = { selector: DataTest.paymentDelete };

  private backToFinancialAssistance = { selector: DataTest.backToFinancialAssistance };

  private relatedNumber = { selector: DataTest.relatedNumber };

  private title = { selector: DataTest.title };

  private paymentLineGroupStatus = { selector: DataTest.paymentLineGroupStatus };

  public selectTable(tableName: string) {
    return cy.searchAndSelect(DataTest.tableSelect, tableName);
  }

  public getTableSelectField() {
    return cy.getByDataTest(this.tableSelect);
  }

  public fillDescription(description: string) {
    return cy.getByDataTest(this.description).type(description);
  }

  public getAddPaymentLineButton() {
    return cy.getByDataTest(this.addPaymentLineButton);
  }

  public addPaymentLine() {
    cy.getByDataTest(this.addPaymentLineButton).click();
    return new AddNewPaymentLinePage();
  }

  public getCreateButton() {
    return cy.getByDataTest(this.createButton);
  }

  public getSectionTitleElement() {
    return cy.getByDataTest(this.title);
  }

  public getPaymentLineGroupTitle() {
    return cy.getByDataTest(this.paymentLineGroupTitle).getAndTrimText();
  }

  public getPaymentLineItemTitle() {
    return cy.getByDataTest(this.paymentLineItemTitle).getAndTrimText();
  }

  public getItemEditButton() {
    return cy.getByDataTest(this.itemEditButton);
  }

  public getItemDeleteButton() {
    return cy.getByDataTest(this.itemDeleteButton);
  }

  public getSubmitAssistanceButton() {
    return cy.getByDataTest(this.submitAssistanceButton);
  }

  public getPaymentStatus() {
    return cy.getByDataTest(this.paymentStatus).getAndTrimText();
  }

  public getPaymentEditButton() {
    return cy.getByDataTest(this.paymentEdit);
  }

  public getPaymentDeleteButton() {
    return cy.getByDataTest(this.paymentDelete);
  }

  public getBackToFinancialAssistanceButton() {
    return cy.getByDataTest(this.backToFinancialAssistance);
  }

  public getRelatedNumber() {
    return cy.getByDataTest(this.relatedNumber).getAndTrimText();
  }

  public getPaymentLineGroupStatus() {
    return cy.getByDataTest(this.paymentLineGroupStatus).getAndTrimText();
  }

  public getCancelButton() {
    return cy.getByDataTest(this.backToFinancialAssistance);
  }
}
