import { IEventGenericLocation } from '@libs/entities-lib/event';

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

  async fill(data: IEventGenericLocation, roleName:string) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.shelterLocationName).type(data.name.translation.en).type(roleName);
    }

    if (data.address.country) {
      cy.selectCountry(DataTest.country, { countryCode: data.address.country, search: 'Canada' });
    }

    if (data.address.streetAddress) {
      cy.getByDataTest(this.streetAddress).type(data.address.streetAddress);
    }

    if (data.address.city) {
      cy.getByDataTest(this.municipality).type(data.address.city);
    }

    if (data.address.province) {
      cy.selectListElementByIndex(DataTest.province, data.address.province - 1);
    }

    if (data.address.postalCode) {
      cy.getByDataTest(this.postalCode).type(data.address.postalCode);
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
