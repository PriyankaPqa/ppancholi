import { splitDate } from '@libs/cypress-lib/helpers';
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { IFixtureTemporaryAddress } from '../../../fixtures/case-management';

export enum DataTest {
  checkInInput = 'filterToolbar__input-currentAddressForm-dateRange-start',
  checkOutInput = 'filterToolbar__input-currentAddressForm-dateRange-end',
  editAddressDialogTitle = 'dialog-title',
  cancelButton = 'dialog-cancel-action',
  saveButton = 'dialog-submit-action',
  closeButton = 'dialog-close',
  tempAddressUnitSuite = 'tempAddress__unitSuite',
  tempAddressStreetAddress = 'tempAddress__street',
  tempAddressMunicipality = 'tempAddress__city',
  tempAddressProvince = 'tempAddress__province',
  tempAddressPostalCode = 'tempAddress__postalCode',
  tempAddressCountry = 'tempAddress__country',
  tempAddress = 'tempAddress__currentAddressType',
  tempAddressAutoComplete = 'temporary_address_autocomplete',
  crcProvidedYes = 'CRC_provided_yes',
  crcProvidedNo = 'CRC_provided_no',
  sameCurrentAddressTitle = 'same_current_address',
  sameCurrentAddressYes = 'same_current_address_yes',
  sameCurrentAddressNo = 'same_current_address_no',
}

const addressTypeHasCrcProvided = [
  ECurrentAddressTypes.Campground,
  ECurrentAddressTypes.HotelMotel,
  ECurrentAddressTypes.MedicalFacility,
  ECurrentAddressTypes.Other,
  ECurrentAddressTypes.Shelter,
];

export class CaseFileImpactedIndividualsEditAddressPage {
  private checkInInput = { selector: DataTest.checkInInput, type: 'input' };

  private checkOutInput = { selector: DataTest.checkOutInput, type: 'input' };

  private editAddressDialogTitle = { selector: DataTest.editAddressDialogTitle };

  private cancelButton = { selector: DataTest.cancelButton };

  private saveButton = { selector: DataTest.saveButton };

  private closeButton = { selector: DataTest.closeButton };

  private unitSuite = { selector: DataTest.tempAddressUnitSuite, type: 'input' };

  private streetAddress = { selector: DataTest.tempAddressStreetAddress, type: 'input' };

  private municipality = { selector: DataTest.tempAddressMunicipality, type: 'input' };

  private province = { selector: DataTest.tempAddressProvince };

  private postalCode = { selector: DataTest.tempAddressPostalCode, type: 'input' };

  private country = { selector: DataTest.tempAddressCountry };

  private tempAddress = { selector: DataTest.tempAddress };

  private tempAddressInput = { selector: `${DataTest.tempAddress}_inner_input`, type: 'input' };

  private tempAddressAutoComplete = { selector: DataTest.tempAddressAutoComplete, type: 'input' };

  private crcProvidedYes = { selector: DataTest.crcProvidedYes, type: 'input' };

  private crcProvidedNo = { selector: DataTest.crcProvidedNo, type: 'input' };

  private sameCurrentAddressTitle = { selector: DataTest.sameCurrentAddressTitle };

  private sameCurrentAddressYes = { selector: DataTest.sameCurrentAddressYes, type: 'input' };

  private sameCurrentAddressNo = { selector: DataTest.sameCurrentAddressNo, type: 'input' };

  setTempAddressType(value: string) {
    cy.selectListElementByValue(DataTest.tempAddress, value);
  }

  getUnitSuite() {
    return cy.getByDataTest(this.unitSuite);
  }

  getStreetAddress() {
    return cy.getByDataTest(this.streetAddress);
  }

  getMunicipality() {
    return cy.getByDataTest(this.municipality);
  }

  getProvince() {
    return cy.getByDataTest(this.province).getAndTrimText();
  }

  getPostalCode() {
    return cy.getByDataTest(this.postalCode);
  }

  getCountry() {
    return cy.getByDataTest(this.country).getAndTrimText();
  }

  fillTempAddressInput() {
    return cy.getByDataTest(this.tempAddressInput);
  }

  getTempAddress() {
    return cy.getByDataTest(this.tempAddress).getAndTrimText();
  }

  getTempAddressAutoComplete() {
    return cy.getByDataTest(this.tempAddressAutoComplete);
  }

  public getCheckInInput() {
    return cy.getByDataTest(this.checkInInput);
  }

  public getCheckOutInput() {
    return cy.getByDataTest(this.checkOutInput);
  }

  public getEditAddressDialogTitle() {
    return cy.getByDataTest(this.editAddressDialogTitle).getAndTrimText();
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getSaveButton() {
    return cy.getByDataTest(this.saveButton);
  }

  public getCloseButton() {
    return cy.getByDataTest(this.closeButton);
  }

  public getCrcProvidedYes() {
    return cy.getByDataTest(this.crcProvidedYes);
  }

  public getCrcProvidedNo() {
    return cy.getByDataTest(this.crcProvidedNo);
  }

  public getSameCurrentAddressTitle() {
    return cy.getByDataTest(this.sameCurrentAddressTitle).getAndTrimText();
  }

  public getSameCurrentAddressYes() {
    return cy.getByDataTest(this.sameCurrentAddressYes);
  }

  public getSameCurrentAddressNo() {
    return cy.getByDataTest(this.sameCurrentAddressNo);
  }

  async fill(data: IFixtureTemporaryAddress) {
    if (data.checkIn) {
      const { year, month, day } = splitDate(data.checkIn.toString());
      cy.setDatePicker(DataTest.checkInInput, { year, month, day });
    }

    if (data.checkOut) {
      const { year, month, day } = splitDate(data.checkOut.toString());
      cy.setDatePicker(DataTest.checkOutInput, { year, month, day });
    }

    if (addressTypeHasCrcProvided.indexOf(data.addressType) >= 0) {
      if (data.crcProvided) {
        this.getCrcProvidedYes().click();
      } else {
        this.getCrcProvidedNo().click();
      }
    }

    if (data.address.streetAddress) {
      this.getStreetAddress().clear().type(data.address.streetAddress);
    }

    if (data.address.unitSuite) {
      this.getUnitSuite().clear().type(data.address.unitSuite);
    }

    if (data.address.unitSuite) {
      this.getUnitSuite().clear().type(data.address.unitSuite);
    }

    if (data.address.city) {
      this.getMunicipality().clear().type(data.address.city);
    }

    if (data.address.province) {
      cy.selectListElementByValue(DataTest.tempAddressProvince, data.address.province);
    }

    if (data.address.postalCode) {
      this.getPostalCode().clear().type(data.address.postalCode);
    }
  }
}
