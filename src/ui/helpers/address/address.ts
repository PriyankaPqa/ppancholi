import VueI18n from 'vue-i18n';
import { en, fr } from '@crctech/component-library/src/components/atoms/RcCountrySelect/countries/index';
import { ECanadaProvinces } from '../../../types';
import {IAddress, IAddressData} from '../../../entities/value-objects/address';
import generalHelper from '../general/general';

export default {
  getCanadianProvincesWithoutOther(i18n: VueI18n) {
    const allProvinces = generalHelper.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces', i18n);
    return allProvinces.filter((p) => p.value !== ECanadaProvinces.OT);
  },

  provinceCode(address: IAddress | IAddressData): string {
    if (address?.province && address.province !== ECanadaProvinces.OT) {
      return ECanadaProvinces[address.province];
    } if (address?.specifiedOtherProvince) {
      return address?.specifiedOtherProvince;
    }
    return '';
  },

  getAddressLines(address: IAddress | IAddressData, i18n: VueI18n): string[] {
    const addressLines = [] as string[];

    if (!address) {
      return addressLines;
    }

    const suite = address.unitSuite ? `${address.unitSuite}-` : '';
    const city = address.city ? `${address.city}, ` : '';
    const provinceCode = this.provinceCode(address);
    const province = provinceCode ? `${provinceCode}, ` : '';
    const countryName = this.countryName(address.country, i18n);

    addressLines.push(address.streetAddress ? `${suite + address.streetAddress}` : '');
    addressLines.push(city + province + (address.postalCode || ''));

    if (countryName) {
      addressLines.push(countryName);
    }

    return addressLines;
  },

  countryName(countryCode: string, i18n: VueI18n): string {
    if (!countryCode) return '';

    const countriesData = { en, fr } as Record<string, Record<string, string>>;

    const countries = countriesData[i18n.locale];
    return countries[countryCode];
  },

};
