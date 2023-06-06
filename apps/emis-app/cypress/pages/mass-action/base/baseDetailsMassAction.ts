export enum DataTest {
  name = 'mass_action_name',
  description = 'description',
  status = 'chip-text',
  successes = 'successes',
  buttonProcess = 'processButton',
  typeMassAction = 'massActionTypeText',
  dateCreated = 'dateCreated',
  createdBy = 'createdBy',
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

    public getMassActionName() {
      return cy.getByDataTest(this.name).invoke('text').then((text) => text.trim());
    }

    public getMassActionDescription() {
      return cy.getByDataTest(this.description).invoke('text').then((text) => text.trim());
    }

    public getMassActionStatus() {
      return cy.getByDataTest(this.status);
    }

    private waitForGetMassActionMetadata() {
      cy.intercept({ method: 'GET', url: '**/case-file/mass-actions/metadata/**' }).as('getRequest');
      cy.wait('@getRequest', { timeout: 300000 });
    }

    public refreshUntilCurrentProcessComplete(eventName: string, maxRetries = 10) {
      let retries = 0;
      const waitForSuccessToBeDisplayed = () => {
        cy.contains(eventName).should('be.visible').then(() => {
          if (Cypress.$("[data-test='successes']").length) {
            cy.log('current processing successful');
          } else {
            retries += 1;
            if (retries <= maxRetries) {
                cy.reload().then(() => {
                  this.waitForGetMassActionMetadata();
                  waitForSuccessToBeDisplayed();
                });
            } else {
              throw new Error(`Failed to find success element after ${maxRetries} retries.`);
            }
          }
        });
      };
      waitForSuccessToBeDisplayed();
    }

    public getMassActionSuccessfulCaseFiles() {
      return cy.getByDataTest(this.successes).invoke('text').then((text) => text.trim());
    }

    public getMassActionProcessButton() {
      return cy.getByDataTest(this.buttonProcess);
    }

    public getMassActionType() {
      return cy.getByDataTest(this.typeMassAction).invoke('text').then((text) => text.trim());
    }

    public getMassActionDateCreated() {
      return cy.getByDataTest(this.dateCreated).invoke('text').then((text) => text.trim());
    }

    public getMassActionCreatedBy() {
      return cy.getByDataTest(this.createdBy).invoke('text').then((text) => text.trim());
    }
  }
