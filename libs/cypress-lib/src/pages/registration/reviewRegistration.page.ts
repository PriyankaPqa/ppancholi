import { ConfirmationPage } from './confirmation.page';

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
  private firstName = { selector: DataTest.firstName };

  private lastName = { selector: DataTest.lastName };

  private birthDate = { selector: DataTest.birthDate };

  private gender = { selector: DataTest.gender };

  private preferredLanguage = { selector: DataTest.preferredLanguage };

  private homePhoneNumber = { selector: DataTest.homePhoneNumber };

  private streetHomeAddress = { selector: DataTest.homeAddress };

  private lineHomeAddress = { selector: DataTest.homeLine };

  private additionalMemberName = { selector: DataTest.additionalMemberName };

  private additionalMemberBirthdate = { selector: DataTest.additionalMemberBirthdate };

  private additionalMemberGender = { selector: DataTest.additionalMemberGender };

  private additionalMemberIndigenousIdentity = { selector: DataTest.additionalMemberIndigenousIdentity };

  private nextButton = { selector: DataTest.nextButton };

  private editButton = { selector: DataTest.editButton };

  private saveAfterEditButton = { selector: DataTest.saveAfterEdit };

  public getFirstName() {
    return cy.getByDataTest(this.firstName).getAndTrimText();
  }

  public getLastName() {
    return cy.getByDataTest(this.lastName).getAndTrimText();
  }

  public getPrimaryFullNameMember() {
    return this.getFirstName().then((firstName) => {
      this.getLastName().then((lastName) => `${firstName} ${lastName}`);
    });
  }

  public getBirthDate() {
    return cy.getByDataTest(this.birthDate).getAndTrimText();
  }

  public getGender() {
    return cy.getByDataTest(this.gender).getAndTrimText();
  }

  public getPreferredLanguage() {
    return cy.getByDataTest(this.preferredLanguage).getAndTrimText();
  }

  public getHomePhoneNumber() {
    return cy.getByDataTest(this.homePhoneNumber).getAndTrimText();
  }

  public getStreetHomeAddress() {
    return cy.getByDataTest(this.streetHomeAddress).getAndTrimText();
  }

  public getLineHomeAddress() {
    return cy.getByDataTest(this.lineHomeAddress).getAndTrimText();
  }

  public getAdditionalMemberName(index: number) {
    return cy.getByDataTest(this.additionalMemberName).eq(index).getAndTrimText();
  }

  public getAdditionalMemberBirthdate(index: number) {
    return cy.getByDataTest(this.additionalMemberBirthdate).eq(index).getAndTrimText();
  }

  public getAdditionalMemberGender(index: number) {
    return cy.getByDataTest(this.additionalMemberGender).eq(index).getAndTrimText();
  }

  public getAdditionalMemberIndigenousIdentity() {
    return cy.getByDataTest(this.additionalMemberIndigenousIdentity).getAndTrimText();
  }

  public editPersonalInformation() {
    cy.getByDataTest(this.editButton).click();
  }

  public submitRegistration() {
  cy.getByDataTest(this.saveAfterEditButton).click();
  }

  public goToConfirmationPage() {
    cy.getByDataTest(this.nextButton).click();
    return new ConfirmationPage();
  }

  public getDateOfBirthString(date: Date) {
    const d = new Date(date);
    const month = d.toLocaleString('default', { month: 'long' });
    const dayOfMonth = d.getDate();
    const year = d.getFullYear();
    return `${month.slice(0, 3)} ${dayOfMonth}, ${year}`;
  }
}
