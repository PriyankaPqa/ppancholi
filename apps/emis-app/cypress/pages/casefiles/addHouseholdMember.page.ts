import { splitDate } from '@libs/cypress-lib/helpers';

export enum DataTest {
  firstName = 'additionalMember__firstName',
  middleName = 'additionalMember__middleName',
  lastName = 'additionalMember__lastName',
  preferredName = 'additionalMember__preferredName',
  gender = 'additionalMember__gender',
  month = 'additionalMember__month',
  day = 'additionalMember__day',
  year = 'additionalMember__year',
  indigenousIdentity = 'additionalMember__indigenousType',
  currentAddressSame = 'sameCurrentAddressYes',
  addMember = 'dialog-submit-action',
}

export interface IHouseholdMemberFields {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  gender?: string;
  dateOfBirth?: string;
  indigenousIdentity?: string;
}

export class AddHouseholdMemberPage {
  private firstName = { selector: DataTest.firstName, type: 'input' };

  private middleName = { selector: DataTest.middleName, type: 'input' };

  private lastName = { selector: DataTest.lastName, type: 'input' };

  private preferredName = { selector: DataTest.preferredName, type: 'input' };

  private day = { selector: DataTest.day, type: 'input' };

  private year = { selector: DataTest.year, type: 'input' };

  private currentAddressSame = { selector: DataTest.currentAddressSame, type: 'input' };

  private addMember = { selector: DataTest.addMember };

  async fill(data:IHouseholdMemberFields) {
    if (data.firstName) {
      cy.getByDataTest(this.firstName).type(data.firstName);
    }

    if (data.middleName) {
      cy.getByDataTest(this.middleName).type(data.middleName);
    }

    if (data.lastName) {
      cy.getByDataTest(this.lastName).type(data.lastName);
    }

    if (data.preferredName) {
      cy.getByDataTest(this.preferredName).type(data.preferredName);
    }

    if (data.gender) {
      cy.selectListElementByValue(DataTest.gender, data.gender);
    }

    if (data.dateOfBirth) {
      const { year, month, day } = splitDate(data.dateOfBirth);
      cy.selectListElementByIndex(DataTest.month, month - 1);
      cy.getByDataTest(this.day).type(`${day}`);
      cy.getByDataTest(this.year).type(`${year}`);
    }

    if (data.indigenousIdentity) {
      cy.selectListElementByValue(DataTest.indigenousIdentity, data.indigenousIdentity);
    }
  }

  assignSameTempAddressAsPrimaryMember() {
    cy.getByDataTest(this.currentAddressSame).check({ force: true });
  }

  addHouseholdMember() {
    cy.getByDataTest(this.addMember).click();
  }
}
