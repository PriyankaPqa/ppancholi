import { HouseholdMembersPage } from './householdMembers.page';

export enum DataTest {
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
  private streetAddress = { selector: DataTest.streetAddress, type: 'input' };

  private municipality = { selector: DataTest.municipality, type: 'input' };

  private province = { selector: DataTest.province, type: 'input' };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private tempAddressProvinceName = { selector: DataTest.tempAddressProvinceName, type: 'input' };

  private nextButton = { selector: DataTest.nextButton };

  async fill(data:IAddressPageFields) {
    if (data.streetAddress) {
      cy.getByDataTest(this.streetAddress).type(data.streetAddress);
    }

    if (data.municipality) {
      cy.getByDataTest(this.municipality).type(data.municipality);
    }

    if (data.province) {
      cy.selectListElementByValue(DataTest.province, data.province);
    }

    if (data.postalCode) {
      cy.getByDataTest(this.postalCode).type(data.postalCode);
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
