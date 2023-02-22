export enum DataTest {
  firstName = 'additionalMember__firstName',
  lastName = 'additionalMember__lastName',
  gender = 'additionalMember__gender',
  month = 'additionalMember__month',
  day = 'additionalMember__day',
  year = 'additionalMember__year',
  indigenousIdentity = 'additionalMember__indigenousType',
  sameAddress = 'sameCurrentAddressYes',
  save = 'dialog-submit-action',
}

export interface IAddMembersPersonalInfoFields {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
  indigenousIdentity?: string;
}

export class AddHouseholdMembersPage {
  private firstName = { selector: DataTest.firstName, type: 'input' };

  private lastName = { selector: DataTest.lastName, type: 'input' };

  private gender = { selector: DataTest.gender, type: 'input' };

  private month = { selector: DataTest.month, type: 'input' };

  private day = { selector: DataTest.day, type: 'input' };

  private year = { selector: DataTest.year, type: 'input' };

  private indigenousIdentity = { selector: DataTest.indigenousIdentity, type: 'input' };

  private sameAddress = { selector: DataTest.sameAddress, type: 'input' };

  private save = { selector: DataTest.save };

  async fill(data:IAddMembersPersonalInfoFields) {
    if (data.firstName) {
      cy.getByDataTest(this.firstName).type(data.firstName);
    }

    if (data.lastName) {
      cy.getByDataTest(this.lastName).type(data.lastName);
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

    if (data.gender) {
      cy.selectListElementByValue(DataTest.gender, data.gender);
    }

    if (data.indigenousIdentity) {
      cy.selectListElementByValue(DataTest.indigenousIdentity, data.indigenousIdentity);
    }

    this.selectSameAddress();
  }

  selectSameAddress() {
    cy.getByDataTest(this.sameAddress).check({ force: true });
  }

  addHouseholdMember() {
    cy.getByDataTest(this.save).click();
  }
}
