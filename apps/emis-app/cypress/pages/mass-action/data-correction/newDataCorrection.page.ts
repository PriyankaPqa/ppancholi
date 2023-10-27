import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  massActionCorrectionType = 'massActionType',
  description = 'description',
  fileUpload = 'upload-file',
  next = 'next',
  dialogTitle = 'dialog-title',
  dialogText = 'message__line_0',
  dialogSubmit = 'dialog-submit-action',
  dialogCancel = 'dialog-cancel-action',
  }

  export class NewDataCorrectionPage {
    private massActionCorrectionType = { selector: DataTest.massActionCorrectionType };

    private description = { selector: DataTest.description, type: 'textarea' };

    private fileUpload = { selector: DataTest.fileUpload };

    private next = { selector: DataTest.next };

    private dialogTitle = { selector: DataTest.dialogTitle };

    private dialogText = { selector: DataTest.dialogText };

    private dialogSubmit = { selector: DataTest.dialogSubmit };

    private dialogCancel = { selector: DataTest.dialogCancel };

    public selectMassActionCorrectionType(correctionType: string) {
      cy.selectListElementByValue(DataTest.massActionCorrectionType, correctionType);
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

    public getDialogSubmitButton() {
      return cy.getByDataTest(this.dialogSubmit);
    }

    public confirmPreprocessing() {
      cy.getByDataTest(this.dialogSubmit).click();
      return new BaseDetailsMassAction();
    }

    public getDialogCancelButton() {
      return cy.getByDataTest(this.dialogCancel);
    }
  }
