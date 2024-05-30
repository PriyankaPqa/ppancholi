import { BaseCreateMassAction } from '../base/baseCreateMassAction';
import { MassCaseFileStatusUpdateDetailsPage } from './massCaseFileStatusUpdateDetails.page';

export enum DataTest {
eventName = 'case_file_status_details_event_name',
caseFileStatus = 'case_file_status_details_case_file_status',
reason = 'case_file_status_details_reason',
rationale = 'case_file_status_details_rationale_input',
next = 'next',
dialogTitle = 'dialog-title',
dialogText = 'message__line_0',
fileUpload = 'upload-file',
dialogConfirmCancel = 'cancel-action-dialog-confirmation',
dialogConfirmSubmit = 'submit-action-dialog-confirmation',
}

export interface INewMassCaseFileStatusFields {
  caseFileStatus: string;
  reason?: string;
  reasonSpecifyOther?: string;
  rationale?: string;
}

export class NewMassCaseFileStatusUpdatePage extends BaseCreateMassAction {
  private eventName = { selector: DataTest.eventName, type: 'input' };

  private caseFileStatus = { selector: DataTest.caseFileStatus };

  private reason = { selector: DataTest.reason };

  private rationale = { selector: DataTest.rationale, type: 'textarea' };

  private fileUpload = { selector: DataTest.fileUpload };

  private next = { selector: DataTest.next };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogText = { selector: DataTest.dialogText };

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  public fillEvent(eventName: string) {
    cy.searchAndSelect(DataTest.eventName, eventName);
  }

  public fillCaseFileStatus(status: string) {
    cy.getByDataTest(this.caseFileStatus).click();
    cy.contains(status).click();
  }

  public fillReason(reason: string) {
    cy.selectListElementByValue(DataTest.reason, reason);
  }

  public fillRationale(rationale: string) {
    cy.getByDataTest(this.rationale).type(rationale);
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
    return new MassCaseFileStatusUpdateDetailsPage();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }
}
