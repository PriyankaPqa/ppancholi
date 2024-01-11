import { AddressPage, IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';

export enum DataTest {
  noFixedHomeAdress = 'address__noFixedHomeAddress',
  unitAddress = 'address__unitSuite',
  save = 'dialog-submit-action',
}

export class EditHouseholdAddressPage extends AddressPage {
  private noFixedHomeAdress = { selector: DataTest.noFixedHomeAdress };

  private unitAddress = { selector: DataTest.unitAddress, type: 'input' };

  private save = { selector: DataTest.save };

  async fillUpdatedAddressData(data: IAddressPageFields, roleName: string) {
    this.fill(data);

    if (data.unitNumber) {
      cy.getByDataTest(this.unitAddress).clear().type(`${data.unitNumber} ${roleName}`);
    }
  }

  public fillUnitNumber(data: IAddressPageFields) {
    cy.getByDataTest(this.unitAddress).clear().type(data.unitNumber);
  }

  public getNoFixedHomeAddressCheckbox() {
    return cy.getByDataTest(this.noFixedHomeAdress);
  }

  public saveUpdatedAddress() {
    cy.getByDataTest(this.save).click();
  }
}
