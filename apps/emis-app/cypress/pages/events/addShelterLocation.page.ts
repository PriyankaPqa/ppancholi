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
  countryText = 'selection',
}

export class AddShelterLocationPage {
  private status = { selector: DataTest.status };

  private shelterLocationName = { selector: DataTest.name, type: 'input' };

  private streetAddress = { selector: DataTest.streetAddress, type: 'input' };

  private municipality = { selector: DataTest.municipality, type: 'input' };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private frenchTab = { selector: DataTest.frenchTab };

  private addButton = { selector: DataTest.addButton };

  private countryText = { selector: DataTest.countryText };

  public getShelterLocationStatus() {
    return cy.getByDataTest(this.status).getAndTrimText();
  }

  public getShelterLocationCountry() {
    return cy.getByDataTest(this.countryText).getAndTrimText();
  }

  async fill(data: IEventGenericLocation, roleName:string) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.shelterLocationName).type(data.name.translation.en).type(roleName);
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

    if (data.address.streetAddress) {
      cy.getByDataTest(this.streetAddress).type(data.address.streetAddress);
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
