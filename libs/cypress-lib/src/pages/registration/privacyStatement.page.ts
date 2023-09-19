import { PersonalInformationPage } from './personalInformation.page';

export enum DataTest {
  eventName = 'registration-portal-toolbar-event-name',
  privacyAgreement = 'isPrivacyAgreed',
  nextButton = 'nextButton',
}

export class PrivacyStatementPage {
  private eventName = { selector: DataTest.eventName };

  private privacyAgreement = { selector: DataTest.privacyAgreement, type: 'input' };

  private nextButton = { selector: DataTest.nextButton };

  public getEventName() {
    return cy.getByDataTest(this.eventName).getAndTrimText();
  }

  public getPrivacyCheckbox() {
    return cy.getByDataTest(this.privacyAgreement);
  }

  public goToPersonalInfoPage() {
    cy.getByDataTest(this.nextButton).click();
    return new PersonalInformationPage();
  }
}
