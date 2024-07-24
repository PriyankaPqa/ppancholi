import { DocumentDetailsPage } from './documentDetails.page';

export enum DataTest {
  fileUpload = 'upload-file',
  documentCategory = 'document-category',
  documentNotes = 'document-notes_input',
  cancel = 'cancel',
  save = 'save',
  dialogTitle = 'dialog-title',
  dialogMessage = 'message__line_0',
  confirmDialog = 'submit-action-dialog-confirmation',
  cancelDialog = 'cancel-action-dialog-confirmation',
}

export class AddDocumentPage {
  private fileUpload = { selector: DataTest.fileUpload };

  private documentCategory = { selector: DataTest.documentCategory };

  private documentNotes = { selector: DataTest.documentNotes, type: 'textarea' };

  private cancel = { selector: DataTest.cancel };

  private save = { selector: DataTest.save };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogMessage = { selector: DataTest.dialogMessage };

  private confirmDialog = { selector: DataTest.confirmDialog };

  private cancelDialog = { selector: DataTest.cancelDialog };

  public uploadFile() {
    return cy.getByDataTest(this.fileUpload);
  }

  public chooseDocumentCategory(category: string) {
    return cy.selectListElementByValue(DataTest.documentCategory, category);
  }

  public addDocumentNotes(notes: string) {
    return cy.getByDataTest(this.documentNotes).type(notes);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancel);
  }

  public getAddButton() {
    return cy.getByDataTest(this.save);
  }

  public addDocument() {
    return cy.getByDataTest(this.save).click();
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getDialogMessage() {
    return cy.getByDataTest(this.dialogMessage).getAndTrimText();
  }

  public getDialogSubmitButton() {
    return cy.getByDataTest(this.confirmDialog);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.cancelDialog);
  }

  public confirmDialogSubmit() {
    cy.getByDataTest(this.confirmDialog).click();
    return new DocumentDetailsPage();
  }
}
