import { Selector, t } from 'testcafe';
import Address, { IAddressFields } from './Address';
import { selectListElement } from '../../helpers';

export enum DataTest {
    addressType = 'tempAddress__currentAddressType',
    street = 'tempAddress__street',
    placeNumber = 'tempAddress__placeNumber',
    placeName = 'tempAddress__placeName',
    city = 'tempAddress__city',
    province = 'tempAddress__province',
    specifiedOtherProvince = 'tempAddress__specifiedOtherProvince',
    postalCode = 'tempAddress__postalCode',
    country = 'tempAddress__country',
}

export interface IFields extends IAddressFields {
    addressTypeIndex: number;
    placeNumber?: string;
    placeName?: string;
}

class TemporaryAddress extends Address {
    addressType: Selector

    placeNumber: Selector

    placeName: Selector

    constructor() {
      super(DataTest);
      this.addressType = Selector('input').withAttribute('data-test', DataTest.addressType);
      this.placeNumber = Selector('input').withAttribute('data-test', DataTest.placeNumber);
      this.placeName = Selector('input').withAttribute('data-test', DataTest.placeName);
    }

    async setAddressType(index: number) {
      await selectListElement(DataTest.addressType, index);
    }

    async setPlaceName(placeName: string) {
      await t.typeText(this.placeName(), placeName);
    }

    async setPlaceNumber(placeNumber: string) {
      await t.typeText(this.placeNumber(), placeNumber);
    }

    async fill(fields: IFields) {
      if (fields.addressTypeIndex) {
        await this.setAddressType(fields.addressTypeIndex);
      }
      await super.fill(fields);
      if (fields.placeName) {
        await this.setPlaceName(fields.placeName);
      }
      if (fields.placeNumber) {
        await this.setPlaceNumber(fields.placeNumber);
      }
    }
}

export default new TemporaryAddress();
