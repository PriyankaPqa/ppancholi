import { BeneficiarySearchPage } from './beneficiarySearch.page';

export enum DataTest {
  selectEvent = 'crcRegistrationLandingPage__event',
  startRegistration = 'startRegistration-individual-button',
  title = 'registration-title',
}

export class CrcRegistrationPage {
  private startRegistration = { selector: DataTest.startRegistration };

  private title = { selector: DataTest.title };

  public getPageTitle() {
    return cy.getByDataTest(this.title).invoke('text').then((text) => text.trim());
  }

  public fillEvent(eventName: string) {
    cy.searchAndSelect(DataTest.selectEvent, eventName);
  }

  public getBeginRegistrationButton() {
    return cy.getByDataTest(this.startRegistration);
  }

  public beginRegistration() {
    this.getBeginRegistrationButton().should('be.enabled').click();
    return new BeneficiarySearchPage();
  }
}
