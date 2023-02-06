import { PrivacyStatementPage } from './privacyStatement.page';

export enum DataTest {
  beginRegistration = 'startRegistration-individual-button',
}

export class RegistrationPage {
  private beginRegistration = { selector: DataTest.beginRegistration, type: 'button' };

  public gotoRegistrationPage() {
    cy.getByDataTest(this.beginRegistration).click();
    return new PrivacyStatementPage();
  }
}
