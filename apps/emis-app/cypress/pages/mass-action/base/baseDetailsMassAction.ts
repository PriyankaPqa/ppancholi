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
  dialogConfirmCancel = 'cancel-action-dialog-confirmation',
  dialogConfirmSubmit = 'submit-action-dialog-confirmation',
  backToMassActionListButton = 'back_to_mass_action_list_button',
  editButton = 'edit',
  deleteButton = 'delete',
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

  private dialogConfirmSubmit = { selector: DataTest.dialogConfirmSubmit };

  private dialogConfirmCancel = { selector: DataTest.dialogConfirmCancel };

  private backToMassActionListButton = { selector: DataTest.backToMassActionListButton };

  private editButton = { selector: DataTest.editButton };

  private deleteButton = { selector: DataTest.deleteButton };

  public getEditButton() {
    return cy.getByDataTest(this.editButton);
  }

  public getDeleteButton() {
    return cy.getByDataTest(this.deleteButton);
  }

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

  public getMassActionCreatedBy() {
    return cy.getByDataTest(this.createdBy).getAndTrimText();
  }

  public verifyAndGetMassActionCreatedBy(roleName: string) {
    cy.waitAndRefreshUntilConditions(
      {
        // eslint-disable-next-line
        visibilityCondition: () => cy.contains('Created by').should('be.visible').wait(2000),
        checkCondition: () => Cypress.$("[data-test='createdBy']").text().includes(roleName),
      },
      {
        errorMsg: 'Unable to get mass action created by',
      },
    );
    return cy.getByDataTest(this.createdBy).getAndTrimText();
  }

  public waitAndRefreshUntilMassActionStatusUpdated(massActionName: string, status: string) {
    cy.waitAndRefreshUntilConditions(
      {
        // eslint-disable-next-line
        visibilityCondition: () => cy.contains(massActionName).should('be.visible').wait(2000),
        checkCondition: () => Cypress.$("[data-test='chip-text']").text().includes(status),
      },
      {
        errorMsg: 'Unable to get mass action created by',
      },
    );
  }

  public getDialogSubmitButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogConfirmSubmitButton() {
    return cy.getByDataTest(this.dialogConfirmSubmit);
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmCancel);
  }

  public getDialogText() {
    return cy.getByDataTest(this.dialogText).getAndTrimText();
  }

  public confirmProcessing() {
    cy.getByDataTest(this.dialogConfirmSubmit).click();
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

  public getBackToMassActionListButton() {
    return cy.getByDataTest(this.backToMassActionListButton);
  }
}
