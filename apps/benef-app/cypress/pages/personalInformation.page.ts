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
  nextButton = 'nextButton',
}

export interface IPersonalInfoFields {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
  language?: string[];
  emailAddress?: string;
  indigenousIdentity?: string;
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

  private nextButton = { selector: DataTest.nextButton, type: 'button' };

  async fill(data:IPersonalInfoFields) {
    if (data.firstName) {
      cy.getByDataTest(this.firstName).type(data.firstName);
    }

    if (data.lastName) {
      cy.getByDataTest(this.lastName).type(data.lastName);
    }

    if (data.gender) {
      cy.selectListElementByValue(DataTest.gender, data.gender);
    }

    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth);
      const month = date.toLocaleString('default', { month: 'long' });
      const dayOfMonth = date.getDate();
      const year = date.getFullYear();
      cy.selectListElementByValue(DataTest.month, month);
      cy.getByDataTest(this.day).type(`${dayOfMonth}`);
      cy.getByDataTest(this.year).type(`${year}`);
    }

    if (data.language) {
      cy.selectListElementByValue(DataTest.preferredLanguage, data.language[0]);
    }

    if (data.emailAddress) {
      cy.getByDataTest(this.emailAddress).type(data.emailAddress);
    }

    if (data.indigenousIdentity) {
      cy.selectListElementByValue(DataTest.indigenousIdentity, data.indigenousIdentity);
    }
  }

  selectLanguageAlternative(data:IPersonalInfoFields) {
    cy.selectListElementByValue(DataTest.preferredLanguage, data.language[1]);
  }

  saveAndGoToAddressPage() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500); // Validate email could fail otherwise
    cy.getByDataTest(this.nextButton).click();
    return new AddressPage();
  }
}
