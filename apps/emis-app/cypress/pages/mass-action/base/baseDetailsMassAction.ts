export enum DataTest {
  name = 'mass_action_name',
  description = 'description',
  status = 'chip-text',
  successes = 'successes',
  buttonProcess = 'processButton',
  typeMassAction = 'massActionTypeText',
  dateCreated = 'dateCreated',
  createdBy = 'createdBy',
  dialogText = 'message__line_0',
  dialogSubmit = 'dialog-submit-action',
  dialogCancel = 'dialog-cancel-action',
  failures = 'failures',
  downloadButton = 'invalidDownloadButton',
  processLabelOne = 'processLabelOne',
  processLabelTwo = 'processLabelTwo',
  }

  export class BaseDetailsMassAction {
    private name = { selector: DataTest.name };

    private description = { selector: DataTest.description };

    private status = { selector: DataTest.status };

    private successes = { selector: DataTest.successes };

    private buttonProcess = { selector: DataTest.buttonProcess };

    private typeMassAction = { selector: DataTest.typeMassAction };

    private dateCreated = { selector: DataTest.dateCreated };

    private createdBy = { selector: DataTest.createdBy };

    private dialogSubmit = { selector: DataTest.dialogSubmit };

    private dialogText = { selector: DataTest.dialogText };

    private dialogCancel = { selector: DataTest.dialogCancel };

    private failures = { selector: DataTest.failures };

    private downloadButton = { selector: DataTest.downloadButton };

    private processLabelOne = { selector: DataTest.processLabelOne };

    private processLabelTwo = { selector: DataTest.processLabelTwo };

    public getMassActionName() {
      return cy.getByDataTest(this.name).getAndTrimText();
    }

    public getMassActionDescription() {
      return cy.getByDataTest(this.description).getAndTrimText();
    }

    public getMassActionStatus() {
      return cy.getByDataTest(this.status);
    }

    public getMassActionSuccessfulCaseFiles() {
      return cy.getByDataTest(this.successes).getAndTrimText();
    }

    public getMassActionProcessButton() {
      return cy.getByDataTest(this.buttonProcess);
    }

    public getMassActionType() {
      return cy.getByDataTest(this.typeMassAction).getAndTrimText();
    }

    public getMassActionDateCreated() {
      return cy.getByDataTest(this.dateCreated).getAndTrimText();
    }

    public verifyAndGetMassActionCreatedBy() {
      return cy.getByDataTest(this.createdBy)
        .invoke('text')
        .then((text) => {
          if (text) {
            return text.trim();
          }

          // If text is not found, wait for a network request to complete and retry
          return cy.interceptAndRetryUntilNoMoreStatus('**/user-account/user-accounts/metadata/*', 404)
            .then(() => cy.getByDataTest(this.createdBy)
                .invoke('text')
                .then((retryText) => retryText.trim()));
        });
    }

    public getDialogSubmitButton() {
      return cy.getByDataTest(this.dialogSubmit);
    }

    public getDialogCancelButton() {
      return cy.getByDataTest(this.dialogCancel);
    }

    public getDialogText() {
      return cy.getByDataTest(this.dialogText).getAndTrimText();
    }

    public confirmProcessing() {
      cy.getByDataTest(this.dialogSubmit).click();
    }

    public getNumberFailedRecords() {
      return cy.getByDataTest(this.failures).getAndTrimText();
    }

    public getInvalidCasefilesDownloadButton() {
      return cy.getByDataTest(this.downloadButton);
    }

    public getPreProcessingLabelOne() {
      return cy.getByDataTest(this.processLabelOne).getAndTrimText();
    }

    public getPreProcessingLabelTwo() {
      return cy.getByDataTest(this.processLabelTwo).getAndTrimText();
    }
  }
