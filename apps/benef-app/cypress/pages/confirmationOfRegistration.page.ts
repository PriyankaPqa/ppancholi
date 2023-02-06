export enum DataTest {
  registrationMessage = 'confirm-registration-message',
  fullName = 'confirm-registration-full-name',
  registrationNumber = 'confirm-registration-number',
  eventName = 'confirm-registration-event-name',
  phoneAssistance = 'confirm-registration-phoneAssistance',
  printButton = 'printButton',
  closeRegistrationButton = 'nextButton',
}

export class ConfirmationOfRegistrationPage {
  private registrationMessage = { selector: DataTest.registrationMessage, type: 'div' };

  private fullName = { selector: DataTest.fullName, type: 'span' };

  private registrationNumber = { selector: DataTest.registrationNumber, type: 'span' };

  private eventName = { selector: DataTest.eventName, type: 'span' };

  private phoneAssistance = { selector: DataTest.phoneAssistance, type: 'span' };

  private printButton = { selector: DataTest.printButton, type: 'button' };

  private closeRegistrationButton = { selector: DataTest.closeRegistrationButton, type: 'button' };

  public getRegistrationMessage() {
    return cy.getByDataTest(this.registrationMessage).invoke('text').then((text) => text);
  }

  public getFullName() {
    return cy.getByDataTest(this.fullName).invoke('text').then((text) => text);
  }

  public getRegistrationNumber() {
    return cy.getByDataTest(this.registrationNumber).invoke('text').then((text) => text);
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).invoke('text').then((text) => text);
  }

  public getPhoneAssistance() {
    return cy.getByDataTest(this.phoneAssistance).invoke('text').then((text) => text);
  }

  public getPrintButton() {
    return cy.getByDataTest(this.printButton).invoke('text').then((text) => text);
  }

  public closeRegistration() {
    cy.getByDataTest(this.closeRegistrationButton).click();
  }
}
