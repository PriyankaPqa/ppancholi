import { AddressPage } from './address.page';

export enum DataTest {
  firstName = 'personalInfo__firstName',
  lastName = 'personalInfo__lastName',
  gender = 'personalInfo__gender',
  month = 'personalInfo__month',
  day = 'personalInfo__day',
  year = 'personalInfo__year',
  preferredLanguage = 'personalInfo__preferredLanguage',
  emailAddress = 'personalInfo__email',
  indigenousIdentity = 'personalInfo__indigenousType',
  phoneNumber = 'personalInfo__homePhoneNumber',
  nextButton = 'nextButton',
  personalInfoDuplicateError = 'personal_info_duplicate_error',
}

export interface IPersonalInfoFields {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
  preferredLanguage?: string;
  emailAddress?: string;
  indigenousIdentity?: string;
  phoneNumber?: string;
}

export class PersonalInformationPage {
  private firstName = { selector: DataTest.firstName, type: 'input' };

  private lastName = { selector: DataTest.lastName, type: 'input' };

  private gender = { selector: DataTest.gender, type: 'input' };

  private month = { selector: DataTest.month, type: 'input' };

  private day = { selector: DataTest.day, type: 'input' };

  private year = { selector: DataTest.year, type: 'input' };

  private preferredLanguage = { selector: DataTest.preferredLanguage, type: 'input' };

  private emailAddress = { selector: DataTest.emailAddress, type: 'input' };

  private indigenousIdentity = { selector: DataTest.indigenousIdentity, type: 'input' };

  private phoneNumber = { selector: DataTest.phoneNumber, type: 'input' };

  private nextButton = { selector: DataTest.nextButton };

  private personalInfoDuplicateError = { selector: DataTest.personalInfoDuplicateError };

  async fill(data: IPersonalInfoFields, roleName: string) {
    if (data.firstName) {
      cy.getByDataTest(this.firstName).clear().type(`${roleName}${data.firstName}`);
    }

    if (data.lastName) {
      cy.getByDataTest(this.lastName).clear().type(data.lastName);
    }

    if (data.gender) {
      cy.selectListElementByValue(DataTest.gender, data.gender);
    }

    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth);
      const dayOfMonth = date.getUTCDate();
      const year = date.getUTCFullYear();
      cy.selectListElementByIndex(DataTest.month, date.getUTCMonth());
      cy.getByDataTest(this.day).clear().type(`${dayOfMonth}`);
      cy.getByDataTest(this.year).clear().type(`${year}`);
    }

    if (data.preferredLanguage) {
      this.selectPreferredLanguage(data.preferredLanguage);
    }

    if (data.emailAddress) {
      cy.intercept({ method: 'POST', url: '**/validate-email-address' }).as('validateEmail');
      cy.getByDataTest(this.emailAddress).type(`${roleName}${data.emailAddress}`);
      cy.getByDataTest(this.emailAddress).blur();
      cy.wait('@validateEmail');
    }

    if (data.indigenousIdentity) {
      cy.selectListElementByValue(DataTest.indigenousIdentity, data.indigenousIdentity);
    }
  }

  selectPreferredLanguage(lang:string) {
    cy.selectListElementByValue(DataTest.preferredLanguage, lang);
  }

  goToAddressPage() {
    cy.getByDataTest(this.nextButton).click();
    return new AddressPage();
  }

  public fillPhoneNumber(phone: string) {
    cy.getByDataTest(this.phoneNumber).clear().type(phone);
  }

  public getPersonalInfoDuplicateErrorElement() {
    return cy.getByDataTest(this.personalInfoDuplicateError);
  }
}
