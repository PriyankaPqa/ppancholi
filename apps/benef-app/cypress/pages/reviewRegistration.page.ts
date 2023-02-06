import { ConfirmationOfRegistrationPage } from './confirmationOfRegistration.page';

export enum DataTest {
  firstName = 'firstName',
  lastName = 'lastName',
  birthDate = 'birthDate',
  gender = 'gender',
  preferredLanguage = 'preferredLanguage',
  homePhoneNumber = 'homePhoneNumber',
  homeAddress = 'homeAddress__street',
  homeLine = 'homeAddress__line',
  additionalMemberName = 'additionalMember__identity',
  additionalMemberBirthdate = 'additionalMember__birthdate',
  additionalMemberGender = 'additionalMember__gender',
  additionalMemberIndigenousIdentity = 'additionalMember__indigenousIdentity',
  nextButton = 'nextButton',
  editButton = '"inlineEdit__open__Personal information"',
  changePersonalInfoPreferredLanguage = 'personalInfo__preferredLanguage',
  saveAfterEdit = '"inlineEdit__save__Personal information"',
}

export class ReviewRegistrationPage {
  private firstName = { selector: DataTest.firstName, type: 'div' };

  private lastName = { selector: DataTest.lastName, type: 'div' };

  private birthDate = { selector: DataTest.birthDate, type: 'div' };

  private gender = { selector: DataTest.gender, type: 'div' };

  private preferredLanguage = { selector: DataTest.preferredLanguage, type: 'div' };

  private homePhoneNumber = { selector: DataTest.homePhoneNumber, type: 'div' };

  private streetHomeAddress = { selector: DataTest.homeAddress, type: 'div' };

  private lineHomeAddress = { selector: DataTest.homeLine, type: 'div' };

  private additionalMemberName = { selector: DataTest.additionalMemberName, type: 'div' };

  private additionalMemberBirthdate = { selector: DataTest.additionalMemberBirthdate, type: 'div' };

  private additionalMemberGender = { selector: DataTest.additionalMemberGender, type: 'span' };

  private additionalMemberIndigenousIdentity = { selector: DataTest.additionalMemberIndigenousIdentity, type: 'span' };

  private nextButton = { selector: DataTest.nextButton, type: 'button' };

  private editButton = { selector: DataTest.editButton, type: 'button' };

  private saveAfterEditButton = { selector: DataTest.saveAfterEdit, type: 'button' };

  public getFirstName() {
    return cy.getByDataTest(this.firstName).invoke('text').then((text) => text);
  }

  public getLastName() {
    return cy.getByDataTest(this.lastName).invoke('text').then((text) => text);
  }

  public getBirthDate() {
    return cy.getByDataTest(this.birthDate).invoke('text').then((text) => text);
  }

  public getGender() {
    return cy.getByDataTest(this.gender).invoke('text').then((text) => text);
  }

  public getPreferredLanguage() {
    return cy.getByDataTest(this.preferredLanguage).invoke('text').then((text) => text);
  }

  public getHomePhoneNumber() {
    return cy.getByDataTest(this.homePhoneNumber).invoke('text').then((text) => text);
  }

  public getStreetHomeAddress() {
    return cy.getByDataTest(this.streetHomeAddress).invoke('text').then((text) => text);
  }

  public getLineHomeAddress() {
    return cy.getByDataTest(this.lineHomeAddress).invoke('text').then((text) => text);
  }

  public getAdditionalMemberName() {
    return cy.getByDataTest(this.additionalMemberName).invoke('text').then((text) => text);
  }

  public getAdditionalMemberBirthdate() {
    return cy.getByDataTest(this.additionalMemberBirthdate).invoke('text').then((text) => text);
  }

  public getAdditionalMemberGender() {
    return cy.getByDataTest(this.additionalMemberGender).invoke('text').then((text) => text);
  }

  public getAdditionalMemberIndigenousIdentity() {
    return cy.getByDataTest(this.additionalMemberIndigenousIdentity).invoke('text').then((text) => text);
  }

  public editPersonalInformation() {
    cy.getByDataTest(this.editButton).click();
  }

  public submitRegistration() {
  cy.getByDataTest(this.saveAfterEditButton).click();
  }

  public saveAndGoToConfirmationPage() {
    cy.getByDataTest(this.nextButton).click();
    return new ConfirmationOfRegistrationPage();
  }

  public getDateOfBirthString(date: Date) {
    const d = new Date(date);
    const month = d.toLocaleString('default', { month: 'long' });
    const dayOfMonth = d.getDate();
    const year = d.getFullYear();
    return `${month.slice(0, 3)} ${dayOfMonth}, ${year}`;
  }
}
