import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  massActionCorrectionType = 'massActionType',
  eventName = 'data-correction-events',
  description = 'description_input',
  fileUpload = 'upload-file',
  next = 'next',
  dialogTitle = 'dialog-title',
  dialogText = 'message__line_0',
  dialogConfirmCancel = 'cancel-action-dialog-confirmation',
  dialogConfirmSubmit = 'submit-action-dialog-confirmation',
}

export class NewDataCorrectionPage {
  private massActionCorrectionType = { selector: DataTest.massActionCorrectionType };

  private description = { selector: DataTest.description, type: 'textarea' };

  private fileUpload = { selector: DataTest.fileUpload };

  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  public selectMassActionCorrectionType(correctionType: string) {
    cy.selectListElementByValue(DataTest.massActionCorrectionType, correctionType);
  }

  public fillEvent(eventName: string) {
    cy.searchAndSelect(DataTest.eventName, eventName);
  }

  public fillMassActionDescription(description: string) {
    cy.getByDataTestLike(this.description).type(description);
  }

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
    return new BaseDetailsMassAction();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
