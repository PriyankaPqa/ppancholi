import { SplitHouseholdPrivacyStatementPage } from '../split/splitHouseholdPrivacyStatement.page';
import { CRCPrivacyStatementPage } from './crcPrivacyStatement.page';
import { AssociateHouseholdPage } from './associateHousehold.page';

export enum DataTest {
  firstName = 'isRegistered__firstName',
  lastName = 'isRegistered__lastName',
  registrationNumber = 'isRegistered__registrationNumber',
  details = 'details__button',
  search = 'search',
  duplicateName = 'name',
  nextButton = 'nextButton',
  backButton = 'backButton',
  privacyAgreement = 'isPrivacyAgreed',
}

export class BeneficiarySearchPage {
  private firstName = { selector: DataTest.firstName, type: 'input' };

  private lastName = { selector: DataTest.lastName, type: 'input' };

  private registrationNumber = { selector: DataTest.registrationNumber, type: 'input' };

  private search = { selector: DataTest.search };

  private details = { selector: DataTest.details };

  private duplicateName = { selector: DataTest.duplicateName };

  private nextButton = { selector: DataTest.nextButton };

  private backButton = { selector: DataTest.backButton };

  private privacyAgreement = { selector: DataTest.privacyAgreement, type: 'input' };

  public getFirstName() {
    return cy.getByDataTest(this.firstName).invoke('val').then((firstName) => `${firstName}`.trim());
  }

  public getLastName() {
    return cy.getByDataTest(this.lastName).invoke('val').then((lastName) => `${lastName}`.trim());
  }

  public searchBeneficiaries() {
    cy.getByDataTest(this.search).click();
  }

  public enterRegistrationNumber(registrationNumber: string) {
    cy.getByDataTest(this.registrationNumber).type(registrationNumber);
  }

  public getDetailsButton() {
    return cy.getByDataTest(this.details);
  }

  public goToAssociateHouseholdPage() {
    cy.getByDataTest(this.details).click();
    return new AssociateHouseholdPage();
  }

  public verifyDuplicateBeneficiary() {
    return cy.getByDataTest(this.duplicateName);
  }

  public goToSelectEventPage() {
    cy.getByDataTest(this.nextButton).click();
    return new SplitHouseholdPrivacyStatementPage();
  }

  public goToCrcPrivacyStatementPage() {
    cy.getByDataTest(this.nextButton).click();
    return new CRCPrivacyStatementPage();
  }

  public getNextButton() {
    return cy.getByDataTest(this.nextButton);
  }

  public getBackButton() {
    return cy.getByDataTest(this.backButton);
  }

  public getPrivacyCheckbox() {
    return cy.getByDataTest(this.privacyAgreement);
  }
}
