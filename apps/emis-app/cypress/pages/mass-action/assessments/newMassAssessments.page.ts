import { BaseCreateMassAction } from '../base/baseCreateMassAction';
import { MassAssessmentsDetailsPage } from './massAssessmentsDetails.page';

export interface INewMassAssessmentFields {
  subjectContent: string,
  contentBeforeLink: string,
  contentAfterLink: string,
}

export enum DataTest {
  eventSelect = 'event_name_select',
  assessmentSelect = 'assessment_name',
  assessmentEmailSubject = 'assessment-email-subject',
  fileUpload = 'upload-file',
  next = 'next',
  dialogTitle = 'dialog-title',
  dialogText = 'message__line_0',
  dialogConfirmCancel = 'cancel-action-dialog-confirmation',
  dialogConfirmSubmit = 'submit-action-dialog-confirmation',
}

export class NewMassAssessmentsPage extends BaseCreateMassAction {
  private eventSelect = { selector: DataTest.eventSelect, type: 'input' };

  private assessmentSelect = { selector: DataTest.assessmentSelect, type: 'input' };

  private assessmentEmailSubject = { selector: DataTest.assessmentEmailSubject, type: 'input' };

  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

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
    cy.searchAndSelect(DataTest.eventSelect, eventName);
  }

  public fillAssessmentName(assessment: string) {
    cy.searchAndSelect(DataTest.assessmentSelect, assessment);
  }

  public fillSubject(subject: string) {
    cy.getByDataTest(this.assessmentEmailSubject).type(subject);
  }

  public fillContentBeforeLink(messageText: string) {
    cy.get('div[id="content-before-link-editor"]').type(messageText);
  }

  public fillContentAfterLink(messageText: string) {
    cy.get('div[id="content-after-link-editor"]').type(messageText);
  }

  public uploadFile() {
    return cy.getByDataTest(this.fileUpload);
  }

  public getDialogConfirmSubmitButton() {
    return cy.getByDataTest(this.dialogConfirmSubmit);
  }

  public confirmPreprocessing() {
    cy.getByDataTest(this.dialogConfirmSubmit).click();
    return new MassAssessmentsDetailsPage();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
