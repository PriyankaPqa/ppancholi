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

export interface IShelterLocationFields {
  name?: IMultilingual;
  country?: string;
  streetAddress?: string;
  city?: string;
  provinceIndex?: ECanadaProvinces;
  postalCode?: string;
}

export class AddShelterLocationPage {
  private status = { selector: DataTest.status };

  private shelterLocationName = { selector: DataTest.name, type: 'input' };

  private streetAddress = { selector: DataTest.streetAddress, type: 'input' };

  private municipality = { selector: DataTest.municipality, type: 'input' };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private frenchTab = { selector: DataTest.frenchTab };

  private addButton = { selector: DataTest.addButton };

  public getShelterLocationStatus() {
    return cy.getByDataTest(this.status).invoke('text').then((text) => text.trim());
  }

  async fill(data: IShelterLocationFields, roleName:string) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.shelterLocationName).type(data.name.translation.en).type(roleName);
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

  public fillFrenchShelterLocationName(locationName: string, roleName:string) {
    cy.getByDataTest(this.shelterLocationName).clear().type(locationName).type(roleName);
  }

  public addNewShelterLocation() {
    cy.getByDataTest(this.addButton).click();
  }
}
