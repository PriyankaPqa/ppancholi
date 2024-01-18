import { BaseCreateMassAction } from '../base/baseCreateMassAction';
import { MassFinancialAssistanceDetailsPage } from './massFinancialAssistanceDetails.page';

export enum DataTest {
eventName = 'payment_event_name',
tableName = 'payment_table_name',
item = 'payment_item',
subItem = 'payment_subItem',
modalityPayment = 'payment_modality',
amountPayment = 'payment_amount',
next = 'next',
dialogTitle = 'dialog-title',
dialogText = 'message__line_0',
fileUpload = 'upload-file',
dialogConfirmCancel = 'cancel-action-dialog-confirmation',
dialogConfirmSubmit = 'submit-action-dialog-confirmation',
}

export interface INewMassFinancialAssistanceFields {
  paymentModality?: string;
  item?:string;
  subItem?:string;
  paymentAmount?:string;
}

export class NewMassFinancialAssistancePage extends BaseCreateMassAction {
  private eventName = { selector: DataTest.eventName, type: 'input' };

  private tableName = { selector: DataTest.tableName, type: 'input' };

  private item = { selector: DataTest.item, type: 'input' };

  private subItem = { selector: DataTest.subItem, type: 'input' };

  private modalityPayment = { selector: DataTest.modalityPayment, type: 'input' };

  private amountPayment = { selector: DataTest.amountPayment, type: 'input' };

  private fileUpload = { selector: DataTest.fileUpload };

  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  public fillEvent(eventName: string) {
    cy.searchAndSelect(DataTest.eventName, eventName);
  }

  public fillTableName(tableName: string) {
    cy.searchAndSelect(DataTest.tableName, tableName);
  }

  async fillItemSubItem(data: INewMassFinancialAssistanceFields) {
    if (data.item) {
      cy.searchAndSelect(DataTest.item, data.item);
    }
    if (data.subItem) {
      cy.searchAndSelect(DataTest.subItem, data.subItem);
    }
  }

  public fillPaymentModality(paymentModality: string) {
    cy.searchAndSelect(DataTest.modalityPayment, paymentModality);
  }

  public uploadFile() {
    return cy.getByDataTest(this.fileUpload);
  }

  public getPaymentAmount() {
    return cy.getByDataTestLike(this.amountPayment);
  }

  public clickNext() {
    cy.getByDataTest(this.next).click();
  }

  public getDialogTitle() {
    return cy.getByDataTest(this.dialogTitle).getAndTrimText();
  }

  public getDialogText() {
    return cy.getByDataTest(this.dialogText).getAndTrimText();
  }

  public getDialogConfirmSubmitButton() {
    return cy.getByDataTest(this.dialogConfirmSubmit);
  }

  public confirmPreprocessing() {
    cy.getByDataTest(this.dialogConfirmSubmit).click();
    return new MassFinancialAssistanceDetailsPage();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
