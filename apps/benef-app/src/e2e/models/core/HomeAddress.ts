import { Selector, t } from 'testcafe';
import Address, { IAddressFields } from './Address';

export enum DataTest {
    street = 'address__street',
    unitSuite = 'address__unitSuite',
    city = 'address__city',
    province = 'address__province',
    specifiedOtherProvince = 'address__specifiedOtherProvince',
    postalCode = 'address__postalCode',
    country = 'address__country',
    noHomeAddressCheckbox = 'address__noFixedHomeAddress'
}

export interface IFields extends IAddressFields{
    unitSuite?: string;
}

class HomeAddress extends Address {
    unitSuite: Selector

    checkbox: Selector;

    constructor() {
      super(DataTest);
      this.unitSuite = Selector('input').withAttribute('data-test', DataTest.unitSuite);
      this.checkbox = Selector('input').withAttribute('data-test', DataTest.noHomeAddressCheckbox);
    }

    async setUnitSuite(unitSuite: string) {
      await t.typeText(this.unitSuite(), unitSuite);
    }

    async clickCheckBox() {
      await t.click(this.checkbox());
    }

    async fill(fields: IFields) {
      await super.fill(fields);
      if (fields.unitSuite) {
        await this.setUnitSuite(fields.unitSuite);
      }
    }
}

export default new HomeAddress();
