import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  event = 'event',
  caseFileStatus = 'status',
  reason = 'reason',
  rationale = 'rationale',
  showErrorsButton = 'showErrorsButton',
  errorMessage = 'errorMessage',
  invalidDownloadButton = 'invalidDownloadButton',
}

export class MassCaseFileStatusUpdateDetailsPage extends BaseDetailsMassAction {
  private event = { selector: DataTest.event };

  private caseFileStatus = { selector: DataTest.caseFileStatus };

  private reason = { selector: DataTest.reason };

  private rationale = { selector: DataTest.rationale };

  private showErrorsButton = { selector: DataTest.showErrorsButton };

  private errorMessage = { selector: DataTest.errorMessage };

  private invalidDownloadButton = { selector: DataTest.invalidDownloadButton };

  public getMassActionCaseFileStatusDetailsEvent() {
    return cy.getByDataTest(this.event).getAndTrimText();
  }

  public getMassActionCaseFileStatusDetailsCaseFileStatus() {
    return cy.getByDataTest(this.caseFileStatus).getAndTrimText();
  }

  public getMassActionCaseFileStatusDetailsReason() {
    return cy.getByDataTest(this.reason).getAndTrimText();
  }

  public getMassActionCaseFileStatusDetailsRationale() {
    return cy.getByDataTest(this.rationale).getAndTrimText();
  }

  public clickShowErrorsButton() {
    return cy.getByDataTest(this.showErrorsButton).click();
  }

  public getErrorMessage() {
    return cy.getByDataTest(this.errorMessage).invoke('text').then((text) => text);
  }

  public clickInvalidDownloadButton() {
    return cy.getByDataTest(this.invalidDownloadButton).click();
  }
}
