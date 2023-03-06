import { ECanadaProvinces, IMultilingual } from '@libs/shared-lib/types';

export enum DataTest {
  status = 'location-status',
  name = 'location-name',
  streetAddress = 'location-streetAddress',
  municipality = 'location-city',
  province = 'location-province',
  postalCode = 'location-postalCode',
  country = 'location-country',
  frenchTab = 'tab-lang-fr',
  addButton = 'dialog-submit-action',
}

export interface IRegistrationLocationFields {
  name?: IMultilingual;
  country?: string;
  streetAddress?: string;
  city?: string;
  provinceIndex?: ECanadaProvinces;
  postalCode?: string;
}

export class AddRegistrationLocationPage {
  private status = { selector: DataTest.status };

  private registrationLocationName = { selector: DataTest.name, type: 'input' };

  private streetAddress = { selector: DataTest.streetAddress, type: 'input' };

  private municipality = { selector: DataTest.municipality, type: 'input' };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private frenchTab = { selector: DataTest.frenchTab };

  private addButton = { selector: DataTest.addButton };

  public getRegistrationLocationStatus() {
    return cy.getByDataTest(this.status).invoke('text').then((text) => text.trim());
  }

  async fill(data: IRegistrationLocationFields, roleName: string) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.registrationLocationName).type(data.name.translation.en).type(roleName);
    }

    if (data.country) {
      cy.selectCountry(DataTest.country, { countryCode: data.country, search: 'Canada' });
    }

    if (data.streetAddress) {
      cy.getByDataTest(this.streetAddress).type(data.streetAddress);
    }

    if (data.city) {
      cy.getByDataTest(this.municipality).type(data.city);
    }

    if (data.provinceIndex) {
      cy.selectListElementByIndex(DataTest.province, data.provinceIndex - 1);
    }

    if (data.postalCode) {
      cy.getByDataTest(this.postalCode).type(data.postalCode);
    }
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }

  public fillFrenchRegistrationLocationName(locationName: string, roleName: string) {
    cy.getByDataTest(this.registrationLocationName).clear().type(locationName).type(roleName);
  }

  public addNewRegistrationLocation() {
    cy.getByDataTest(this.addButton).click();
  }
}
