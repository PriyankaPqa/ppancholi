export enum DataTest {
  registrationMessage = 'confirm-registration-message',
  fullName = 'confirm-registration-full-name',
  registrationNumber = 'confirm-registration-number',
  eventName = 'confirm-registration-event-name',
  phoneAssistance = 'confirm-registration-phoneAssistance',
  printButton = 'printButton',
  closeRegistrationButton = 'nextButton',
}

export class ConfirmationPage {
  private registrationMessage = { selector: DataTest.registrationMessage };

  private fullName = { selector: DataTest.fullName };

  private registrationNumber = { selector: DataTest.registrationNumber };

  private eventName = { selector: DataTest.eventName };

  private phoneAssistance = { selector: DataTest.phoneAssistance };

  private printButton = { selector: DataTest.printButton };

  private closeRegistrationButton = { selector: DataTest.closeRegistrationButton };

  public getMessage() {
    return cy.getByDataTest(this.registrationMessage).invoke('text').then((text) => text.trim());
  }

  public getFullName() {
    return cy.getByDataTest(this.fullName).invoke('text').then((text) => text.trim());
  }

  public getRegistrationNumber() {
    return cy.getByDataTest(this.registrationNumber).invoke('text').then((text) => text.trim());
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).invoke('text').then((text) => text.trim());
  }

  public getPhoneAssistance() {
    return cy.getByDataTest(this.phoneAssistance).invoke('text').then((text) => text.trim());
  }

  public getPrintButton() {
    return cy.getByDataTest(this.printButton).invoke('text').then((text) => text.trim());
  }

  public closeRegistration() {
    cy.getByDataTest(this.closeRegistrationButton).click();
  }
}
