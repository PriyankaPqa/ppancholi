import {
  EIndigenousTypes, IIndigenousCommunityData, IMember, HouseholdCreate,
} from '@crctech/registration-lib/src/entities/household-create/index';
import { en, fr } from '@crctech/component-library/src/components/atoms/RcCountrySelect/countries/index';
import { IBirthDate } from '@crctech/registration-lib/src/entities/value-objects/identity-set/identitySet.types';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import helpers from '@/ui/helpers/helpers';
import { ECanadaProvinces, IAddress } from '@/types';
import { i18n } from '@/ui/plugins';

import store from '@/store/store';
import moment from '@/ui/plugins/moment';

export default {
  preferredLanguage(member: IMember): string {
    if (!member.contactInformation?.preferredLanguage) return '';
    if (member.contactInformation.preferredLanguage.isOther) return member.contactInformation.preferredLanguageOther;
    return helpers.getMultilingualValue(member.contactInformation.preferredLanguage.name);
  },

  primarySpokenLanguage(member: IMember): string {
    if (!member.contactInformation?.primarySpokenLanguage) return '';
    if (member.contactInformation.primarySpokenLanguage.isOther) return member.contactInformation.primarySpokenLanguageOther;
    return helpers.getMultilingualValue(member.contactInformation.primarySpokenLanguage.name);
  },

  mobilePhoneNumber(member: IMember): string {
    if (member.contactInformation?.mobilePhoneNumber?.number) {
      return member.contactInformation?.mobilePhoneNumber.number;
    }
    return '-';
  },

  homePhoneNumber(member: IMember): string {
    if (member.contactInformation?.homePhoneNumber?.number) {
      return member.contactInformation.homePhoneNumber.number;
    }
    return '-';
  },

  alternatePhoneNumber(member: IMember): string {
    if (member.contactInformation?.alternatePhoneNumber?.number) {
      return member.contactInformation.alternatePhoneNumber.number;
    }
    return '-';
  },

  alternatePhoneExtension(member: IMember): string {
    if (member.contactInformation?.alternatePhoneNumber?.extension) {
      return member.contactInformation.alternatePhoneNumber.extension;
    }
    return '-';
  },

  gender(member: IMember): string {
    if (!member.identitySet?.gender) return '';
    if (member.identitySet.genderOther) return member.identitySet.genderOther;
    return helpers.getMultilingualValue(member.identitySet.gender.name);
  },

  indigenousIdentity(member: IMember, pCommunities = [] as IIndigenousCommunityData[]): string {
    const type = member.identitySet.indigenousType
      ? `${i18n.t(`common.indigenous.types.${EIndigenousTypes[member.identitySet.indigenousType]}`)}, ` : '';

    let communities = [];
    if (pCommunities.length === 0) {
      communities = store.state.registration.indigenousCommunities;
    } else {
      communities = pCommunities;
    }

    const community = communities
      .find((i: IIndigenousCommunityData) => i.id === member.identitySet.indigenousCommunityId);

    let communityName = '';
    if (member.identitySet.indigenousType === EIndigenousTypes.Other) {
      communityName = `${member.identitySet.indigenousCommunityOther}`;
    } else if (member.identitySet.indigenousType && community) {
      communityName = `${community.communityName}`;
    }
    return type + communityName;
  },

  provinceCodeName(address: IAddress): string {
    const provinceCode = address?.province;
    if (!provinceCode || provinceCode === ECanadaProvinces.OT) {
      return address?.specifiedOtherProvince;
    }
    return i18n.t(`common.provinces.code.${ECanadaProvinces[provinceCode]}`) as string;
  },

  countryName(countryCode: string): string {
    if (!countryCode) return '';

    const countriesData = { en, fr } as Record<string, Record<string, string>>;

    const countries = countriesData[i18n.locale];
    return countries[countryCode];
  },

  addressLine1(household: HouseholdCreate): string {
    return this.getAddressLines(household?.homeAddress)[0];
  },

  addressLine2(household: HouseholdCreate): string {
    return this.getAddressLines(household?.homeAddress)[1];
  },

  country(household: HouseholdCreate): string {
    return this.countryName(household.homeAddress.country);
  },

  getAddressLines(address: IAddress): string[] {
    const addressLines = [] as string[];
    if (!address) return addressLines;
    const suite = address.unitSuite ? `${address.unitSuite}-` : '';
    addressLines.push(address.streetAddress ? `${suite + address.streetAddress}` : '');

    const city = address.city ? `${address.city}, ` : '';
    const provinceCodeName = this.provinceCodeName(address);
    const province = provinceCodeName ? `${provinceCodeName}, ` : '';
    addressLines.push(city + province + (address.postalCode || ''));
    if (this.countryName(address.country)) addressLines.push(this.countryName(address.country));
    return addressLines;
  },

  getBirthDateDisplayWithAge(birthDate: IBirthDate): string {
    let result = libHelpers.displayBirthDate(birthDate);
    result += ` (${libHelpers.getAge(birthDate)} ${i18n.t('common.years')})`;
    return result;
  },

  convertBirthDateStringToObject(birthdate: string) {
    const bdayMoment = moment(birthdate).utc();

    return {
      month: bdayMoment.month() + 1,
      day: `${bdayMoment.date()}`,
      year: `${bdayMoment.year()}`,
    };
  },
};
