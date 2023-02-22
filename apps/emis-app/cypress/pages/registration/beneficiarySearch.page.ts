import { SplitHouseholdPrivacyStatementPage } from '../split/splitHouseholdPrivacyStatement.page';

export enum DataTest {
  firstName = 'isRegistered__firstName',
  lastName = 'isRegistered__lastName',
  search = 'search',
  duplicateName = 'name',
  nextButton = 'nextButton',
}

export class BeneficiarySearchPage {
  private firstName = { selector: DataTest.firstName, type: 'input' };

  private lastName = { selector: DataTest.lastName, type: 'input' };

  private search = { selector: DataTest.search };

  private duplicateName = { selector: DataTest.duplicateName };

  private nextButton = { selector: DataTest.nextButton };

  public getFirstName() {
    return cy.getByDataTest(this.firstName).invoke('val').then((firstName) => `${firstName}`.trim());
  }

  public getLastName() {
    return cy.getByDataTest(this.lastName).invoke('val').then((lastName) => `${lastName}`.trim());
  }

  public searchBeneficiaries() {
    cy.getByDataTest(this.search).click();
  }

  public verifyDuplicateBeneficiary() {
    return cy.getByDataTest(this.duplicateName);
  }

  public goToSelectEventPage() {
    cy.getByDataTest(this.nextButton).click();
    return new SplitHouseholdPrivacyStatementPage();
  }
}
