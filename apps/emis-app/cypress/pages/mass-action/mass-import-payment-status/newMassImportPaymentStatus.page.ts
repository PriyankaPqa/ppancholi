import { BaseCreateMassAction } from '../base/baseCreateMassAction';
import { MassImportPaymentStatusDetailsPage } from './massImportPaymentStatusDetails.page';

export enum DataTest {
next = 'next',
dialogTitle = 'dialog-title',
dialogText = 'message__line_0',
fileUpload = 'upload-file',
dialogConfirmCancel = 'cancel-action-dialog-confirmation',
dialogConfirmSubmit = 'submit-action-dialog-confirmation',
}

export class NewMassImportPaymentStatusPage extends BaseCreateMassAction {
  private fileUpload = { selector: DataTest.fileUpload };

  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  public uploadFile() {
    return cy.getByDataTest(this.fileUpload);
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
    return new MassImportPaymentStatusDetailsPage();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
