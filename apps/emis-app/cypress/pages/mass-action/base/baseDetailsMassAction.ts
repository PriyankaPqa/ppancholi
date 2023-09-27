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

    public refreshUntilCurrentProcessCompleteWithLabelString(absentElementAttributeValue:string, massFinancialAssistanceName: string, labelString:string, maxRetries = 10) {
      let retries = 0;
      const waitForSuccessLabelToBe = (labelString: string) => {
        // We do negative assertion of absentElementAttributeValue present on previous page, to make sure that next page is loaded before reload() fires
        cy.get(`[data-test='${absentElementAttributeValue}']`).should('not.exist');
        // We make sure the next page (ie Processing mass financial assistance/Mass financial assistance details) is completely loaded
        cy.contains(massFinancialAssistanceName).should('be.visible').then(() => {
          if (Cypress.$("[data-test='successesLabel=']").text().endsWith(labelString)) {
            cy.log('current processing successful');
          } else {
            retries += 1;
            if (retries <= maxRetries) {
                cy.reload().then(() => {
                  waitForSuccessLabelToBe(labelString);
                });
            } else {
              throw new Error(`Failed to find success element after ${maxRetries} retries.`);
            }
          }
        });
      };
      waitForSuccessLabelToBe(labelString);
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

    public verifyAndGetMassActionCreatedBy(roleName:string) {
      this.waitAndRefreshUntilCreatedByTextVisible(roleName);
      return cy.getByDataTest(this.createdBy).getAndTrimText();
    }

    public waitAndRefreshUntilCreatedByTextVisible(roleName:string, maxRetries = 10) {
      let retries = 0;
      const waitForTextToBeVisible = () => {
        cy.contains('Created by').should('be.visible').then(() => {
          if (Cypress.$("[data-test='createdBy']").text().includes(roleName)) {
            cy.log('Created By text visible');
          } else {
            retries += 1;
            if (retries <= maxRetries) {
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).reload().then(() => {
                  waitForTextToBeVisible();
                });
            } else {
              throw new Error(`Failed to find Created By text after ${maxRetries} retries.`);
            }
          }
        });
      };
      waitForTextToBeVisible();
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
