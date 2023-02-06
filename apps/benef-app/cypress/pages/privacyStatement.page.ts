import { PersonalInformationPage } from './personalInformation.page';

export enum DataTest {
  eventName = 'registration-portal-toolbar-event-name',
  privacyAgreement = 'isPrivacyAgreed',
  next = 'nextButton',
}

export class PrivacyStatementPage {
  private eventName = { selector: DataTest.eventName, type: 'span' };

  private privacyAgreement = { selector: DataTest.privacyAgreement, type: 'input' };

  private next = { selector: DataTest.next, type: 'button' };

  public getEventName() {
    return cy.getByDataTest(this.eventName).invoke('text').then((text) => text);
  }

  public agreeToPrivacy() {
    cy.getByDataTest(this.privacyAgreement).check({ force: true });
  }

  public saveAndGoToPersonalInfoPage() {
    cy.getByDataTest(this.next).click();
    return new PersonalInformationPage();
  }
}
