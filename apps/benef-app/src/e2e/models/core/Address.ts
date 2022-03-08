import { Selector, t } from 'testcafe';
import {
  getPressKeySequence, selectListElement, getInputTextValue, getSelectedListItem,
} from '../../helpers';

export interface IDataTest {
    street: string;
    city: string;
    province : string;
    specifiedOtherProvince: string;
    postalCode: string;
    country : string;
}

export interface IAddressFields {
    street?: string;
    unitSuite?: string;
    city?: string;
    canadianProvinceIndex?: number; // If selected country is canada
    province?: string; // If selected country is not canada
    postalCode?: string;
    countryName?: string; // Must be complete so only one country is returned from the select
}

export default class Address {
    street: Selector

    city: Selector

    province: Selector

    specifiedOtherProvince: Selector

    postalCode: Selector

    country: Selector

    dataTest: IDataTest

    constructor(dataTest: IDataTest) {
      this.dataTest = dataTest;
      this.street = Selector('input').withAttribute('data-test', dataTest.street);
      this.city = Selector('input').withAttribute('data-test', dataTest.city);
      this.province = Selector('div').withAttribute('data-test', dataTest.province);
      this.specifiedOtherProvince = Selector('input').withAttribute('data-test', dataTest.specifiedOtherProvince);
      this.postalCode = Selector('input').withAttribute('data-test', dataTest.postalCode);
      this.country = Selector('div').withAttribute('data-test', dataTest.country);
    }

    async setStreet(street: string) {
      await t.typeText(this.street(), street);
    }

    async getStreet(): Promise<string> {
      return getInputTextValue(this.street);
    }

    async setCity(city: string) {
      await t.typeText(this.city(), city);
    }

    async getCity(): Promise<string> {
      return getInputTextValue(this.city);
    }

    async getProvince(): Promise<string> {
      if (await this.getCountry() === 'Canada') {
        return getSelectedListItem(this.province);
      }
      return getInputTextValue(this.specifiedOtherProvince);
    }

    async setCanadianProvince(index: number) {
      await selectListElement(this.dataTest.province, index);
    }

    async setProvince(province: string) {
      await t.typeText(this.specifiedOtherProvince(), province);
    }

    async setPostalCode(postalCode: string) {
      await t.typeText(this.postalCode(), postalCode);
    }

    async setCountry(countryName: string) {
      await t.click(this.country());

      await t.click(this.country())
        .pressKey('ctrl+a backspace') // Remove current selection
        .pressKey(getPressKeySequence(countryName)) // Input wished country
        .pressKey('enter');
    }

    async fill(fields: IAddressFields) {
      if (fields.countryName) {
        await this.setCountry(fields.countryName);
      }
      if (fields.street) {
        await this.setStreet(fields.street);
      }
      if (fields.city) {
        await this.setCity(fields.city);
      }
      if (fields.province) {
        await this.setProvince(fields.province);
      }
      if (fields.canadianProvinceIndex) {
        await this.setCanadianProvince(fields.canadianProvinceIndex);
      }
      if (fields.postalCode) {
        await this.setPostalCode(fields.postalCode);
      }
    }

    async getCountry() {
      const element = await this.country()
        .find('div')
        .withAttribute('data-test', 'selection');

      return element?.innerText;
    }
}
