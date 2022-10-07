import {
  EIndigenousTypes, IIndigenousCommunityData, IMember, HouseholdCreate,
  IAddressData,
  IPhoneNumber,
} from '@libs/entities-lib/household-create/index';
import { IBirthDate } from '@libs/entities-lib/value-objects/identity-set/identitySet.types';
import libHelpers from '@libs/entities-lib/helpers';
import { IAddress } from '@libs/entities-lib/value-objects/address/address.types';
import helpers from '@/ui/helpers/helpers';
import { i18n } from '@/ui/plugins';

import store from '@/store/store';

export default {
  preferredLanguage(member: IMember): string {
    if (!member.contactInformation?.preferredLanguage) {
      return '';
    }
    if (member.contactInformation.preferredLanguage.isOther) {
      return member.contactInformation.preferredLanguageOther;
    }
    return helpers.getMultilingualValue(member.contactInformation.preferredLanguage.name);
  },

  primarySpokenLanguage(member: IMember): string {
    if (!member.contactInformation?.primarySpokenLanguage) {
      return '';
    }
    if (member.contactInformation.primarySpokenLanguage.isOther) {
      return member.contactInformation.primarySpokenLanguageOther;
    }
    return helpers.getMultilingualValue(member.contactInformation.primarySpokenLanguage.name);
  },

  phoneNumberDisplay(phone: IPhoneNumber): string {
    if (!phone) {
      return null;
    }
    return (phone.e164Number || phone.e164number) && phone.countryCode && phone.countryCode !== 'CA'
      && phone.countryCode !== 'US' ? (phone.e164Number || phone.e164number) : phone.number;
  },

  mobilePhoneNumber(member: IMember): string {
    return this.phoneNumberDisplay(member.contactInformation?.mobilePhoneNumber) || '-';
  },

  homePhoneNumber(member: IMember): string {
    return this.phoneNumberDisplay(member.contactInformation.homePhoneNumber) || '-';
  },

  alternatePhoneNumber(member: IMember): string {
    return this.phoneNumberDisplay(member.contactInformation.alternatePhoneNumber) || '-';
  },

  alternatePhoneExtension(member: IMember): string {
    if (member.contactInformation?.alternatePhoneNumber?.extension) {
      return member.contactInformation.alternatePhoneNumber.extension;
    }
    return '-';
  },

  gender(member: IMember): string {
    if (!member.identitySet?.gender) {
      return '';
    }
    if (member.identitySet.genderOther) {
      return member.identitySet.genderOther;
    }
    return helpers.getMultilingualValue(member.identitySet.gender.name);
  },

  indigenousIdentity(member: IMember, pCommunities = [] as IIndigenousCommunityData[]): string {
    // const type = member.identitySet.indigenousType ? `${i18n.t(`common.indigenous.types.${EIndigenousTypes[member.identitySet.indigenousType]}`)}, ` : '';
    const type = member.identitySet.indigenousType ? `${i18n.t(`common.indigenous.types.${EIndigenousTypes[member.identitySet.indigenousType]}`)}` : '';

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
    // return type && communityName ? type + communityName : '-';
    return type && communityName ? type : '-';
  },

  countryName(countryCode: string): string {
    return libHelpers.countryName(countryCode, i18n);
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

  getAddressLines(address: IAddress | IAddressData): string[] {
    return libHelpers.getAddressLines(address, i18n);
  },

  provinceCodeName(address: IAddress | IAddressData): string {
    return libHelpers.provinceCode(address);
  },

  getBirthDateDisplayWithAge(birthDate: IBirthDate): string {
    let result = libHelpers.displayBirthDate(birthDate);
    result += ` (${libHelpers.getAge(birthDate)} ${i18n.t('common.years')})`;
    return result;
  },

  convertBirthDateStringToObject(birthdate: string) {
    return libHelpers.convertBirthDateStringToObject(birthdate);
  },
};
