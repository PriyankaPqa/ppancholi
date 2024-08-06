import { BaseCreateMassAction } from '../base/baseCreateMassAction';
import { MassCommunicationDetailsPage } from './massCommunicationDetails.page';

export interface INewMassCommunicationFields {
  messageSubject: string,
  messageText: string,
}

export enum DataTest {
  communicationFormMethodEmail = 'communication-form-method-email',
  communicationFormMethodSms = 'communication-form-method-sms',
  communicationEventName = 'communication_event_name',
  communicationMessageSubject = 'communication-message-subject',
  communicationMessageText = 'communication-message-text',
  fileUpload = 'upload-file',
  next = 'next',
  dialogTitle = 'dialog-title',
  dialogText = 'message__line_0',
  dialogConfirmCancel = 'cancel-action-dialog-confirmation',
  dialogConfirmSubmit = 'submit-action-dialog-confirmation',
  attachDocumentsUploadFile = 'attach-documents-upload-file',
}

export class NewMassCommunicationPage extends BaseCreateMassAction {
  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  private communicationFormMethodEmail = { selector: DataTest.communicationFormMethodEmail };

  private communicationFormMethodSms = { selector: DataTest.communicationFormMethodSms };

  private communicationEventName = { selector: DataTest.communicationEventName };

  private communicationMessageSubject = { selector: DataTest.communicationMessageSubject, type: 'input' };

  private communicationMessageText = { selector: DataTest.communicationMessageText };

  private attachDocumentsUploadFile = { selector: DataTest.attachDocumentsUploadFile };

  private fileUpload = { selector: DataTest.fileUpload };

  public clickNext() {
    cy.getByDataTest(this.next).click();
  }

  public getDialogTitle() {
    return cy.getByDataTest(this.dialogTitle).getAndTrimText();
  }

  public getDialogText() {
    return cy.getByDataTest(this.dialogText).getAndTrimText();
  }

  public fillEventName(eventName: string) {
    cy.searchAndSelect(DataTest.communicationEventName, eventName);
  }

  public fillCommunicationMessageSubject(messageSubject: string) {
    cy.getByDataTest(this.communicationMessageSubject).type(messageSubject);
  }

  public fillCommunicationMessageText(messageText: string) {
    cy.get('div[id="communication-message-text-editor"]').type(messageText);
  }

  public uploadFile() {
    return cy.getByDataTest(this.fileUpload);
  }

  public uploadAttachFile() {
    return cy.getByDataTest(this.attachDocumentsUploadFile);
  }

  public getDialogConfirmSubmitButton() {
    return cy.getByDataTest(this.dialogConfirmSubmit);
  }

  public confirmPreprocessing() {
    cy.getByDataTest(this.dialogConfirmSubmit).click();
    return new MassCommunicationDetailsPage();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
