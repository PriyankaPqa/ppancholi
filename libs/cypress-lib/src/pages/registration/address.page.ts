import { HouseholdMembersPage } from './householdMembers.page';

export enum DataTest {
  unitSuite = 'address__unitSuite',
  streetAddress = 'address__street',
  municipality = 'address__city',
  province = 'address__province',
  postalCode = 'address__postalCode',
  country = 'address__country',
  tempAddress = 'tempAddress__currentAddressType',
  tempAddressPlaceName = 'tempAddress__placeName',
  tempAddressCityName = 'tempAddress__city',
  tempAddressProvinceName = 'tempAddress__province',
  nextButton = 'nextButton',
}

export interface IAddressPageFields {
  unitNumber?: string,
  streetAddress?: string;
  municipality?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  tempAddress?: string;
  placeName?: string;
}

export class AddressPage {
  private unitSuite = { selector: DataTest.unitSuite, type: 'input' };

  private streetAddress = { selector: DataTest.streetAddress, type: 'input' };

  private municipality = { selector: DataTest.municipality, type: 'input' };

  private province = { selector: DataTest.province, type: 'input' };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private tempAddressProvinceName = { selector: DataTest.tempAddressProvinceName, type: 'input' };

  private nextButton = { selector: DataTest.nextButton };

  async fill(data:IAddressPageFields) {
    if (data.unitNumber) {
      cy.getByDataTest(this.unitSuite).clear().type(data.unitNumber);
    }

    if (data.streetAddress) {
      cy.getByDataTest(this.streetAddress).clear().type(data.streetAddress);
    }

    if (data.municipality) {
      cy.getByDataTest(this.municipality).clear().type(data.municipality);
    }

    if (data.province) {
      cy.selectListElementByValue(DataTest.province, data.province);
    }

    if (data.postalCode) {
      cy.getByDataTest(this.postalCode).clear().type(data.postalCode);
    }

    if (data.tempAddress) {
      cy.selectListElementByValue(DataTest.tempAddress, data.tempAddress);
    }
  }

  goToHouseholdMembersPage() {
    cy.getByDataTest(this.nextButton).click();
    return new HouseholdMembersPage();
  }
}
