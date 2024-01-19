export enum DataTest {
  registrationMessage = 'confirm-registration-message',
  fullName = 'confirm-registration-full-name',
  registrationNumber = 'confirm-registration-number',
  eventName = 'confirm-registration-event-name',
  phoneAssistance = 'confirm-registration-phoneAssistance',
  printButton = 'printButton',
  closeRegistrationButton = 'nextButton',
  title = 'page-title',
  errorTitleDuplicateRegistration = 'confirmation-errorRegistration-errorTitle',
  errorMessageDuplicateRegistration = 'confirmation-errorRegistration-errorMessage',
  errorBeneficiarySearchButton = 'confirmation-errorRegistration-beneficiarySearchButton',
}

export class ConfirmationPage {
  private registrationMessage = { selector: DataTest.registrationMessage };

  private fullName = { selector: DataTest.fullName };

  private registrationNumber = { selector: DataTest.registrationNumber };

  private eventName = { selector: DataTest.eventName };

  private phoneAssistance = { selector: DataTest.phoneAssistance };

  private printButton = { selector: DataTest.printButton };

  private closeRegistrationButton = { selector: DataTest.closeRegistrationButton };

  private title = { selector: DataTest.title };

  private errorDuplicateRegistration = { selector: DataTest.errorTitleDuplicateRegistration };

  private errorMessageDuplicateRegistration = { selector: DataTest.errorMessageDuplicateRegistration };

  private errorBeneficiarySearchButton = { selector: DataTest.errorBeneficiarySearchButton };

  public getMessage() {
    return cy.getByDataTest(this.registrationMessage).getAndTrimText();
  }

  public getFullName() {
    return cy.getByDataTest(this.fullName).getAndTrimText();
  }

  public getRegistrationNumber() {
    return cy.getByDataTest(this.registrationNumber).getAndTrimText();
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).getAndTrimText();
  }

  public getPhoneAssistance() {
    return cy.getByDataTest(this.phoneAssistance).getAndTrimText();
  }

  public getPrintButton() {
    return cy.getByDataTest(this.printButton);
  }

  public closeRegistration() {
    cy.getByDataTest(this.closeRegistrationButton).click();
  }

  public getPageTitle() {
    return cy.getByDataTest(this.title).getAndTrimText();
  }

  public getErrorTitleDuplicateRegistration() {
    return cy.getByDataTest(this.errorDuplicateRegistration).getAndTrimText();
  }

  public getErrorMessageDuplicateRegistration() {
    return cy.getByDataTest(this.errorMessageDuplicateRegistration).getAndTrimText();
  }

  public getSearchHouseholdButton() {
    return cy.getByDataTest(this.errorBeneficiarySearchButton);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.closeRegistrationButton);
  }
}
