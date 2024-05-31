import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  showErrorsButton = 'showErrorsButton',
  errorMessage = 'errorMessage',
  }

  export class MassImportPaymentStatusDetailsPage extends BaseDetailsMassAction {
    private showErrorsButton = { selector: DataTest.showErrorsButton };

    private errorMessage = { selector: DataTest.errorMessage };

    public clickShowErrorsButton() {
      return cy.getByDataTest(this.showErrorsButton).click();
    }

    public getErrorMessage() {
      return cy.getByDataTest(this.errorMessage).invoke('text').then((text) => text);
    }
  }
