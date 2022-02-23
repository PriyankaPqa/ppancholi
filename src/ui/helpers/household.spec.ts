/**
 * @group ui/helpers
 */

import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member/index';
import {
  EIndigenousTypes, IMember, mockIndigenousCommunitiesGetData, mockHouseholdCreate, HouseholdCreate,
} from '@crctech/registration-lib/src/entities/household-create';
import _cloneDeep from 'lodash/cloneDeep';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household/index';
import { ECanadaProvinces } from '@crctech/registration-lib/src/types/index';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import householdHelpers from '@/ui/helpers/household';

const member = mockMember({ id: 'id-1' });

describe('householdHelpers', () => {
  describe('preferredLanguage', () => {
    it('returns the right data when preferredLanguage is other', () => {
      const altMember = {
        ...member,
        contactInformation: {
          ...member.contactInformation,
          preferredLanguage: { isOther: true },
          preferredLanguageOther: 'mock-language',
        },
      };

      expect(householdHelpers.preferredLanguage(altMember as IMember)).toEqual('mock-language');
    });

    it('returns the right data when preferredLanguage is not other', () => {
      const altMember = {
        ...member,
        contactInformation: {
          ...member.contactInformation,
          preferredLanguage: { isOther: false, name: { translation: { en: 'bar' } } },
          preferredLanguageOther: '',
        },
      };

      expect(householdHelpers.preferredLanguage(altMember as unknown as IMember)).toEqual('bar');
    });
  });

  describe('primarySpokenLanguage', () => {
    it('returns the right data when primarySpokenLanguage is other', () => {
      const altMember = {
        ...member,
        contactInformation: {
          ...member.contactInformation,
          primarySpokenLanguage: { isOther: true },
          primarySpokenLanguageOther: 'mock-language',
        },
      };

      expect(householdHelpers.primarySpokenLanguage(altMember as unknown as IMember)).toEqual('mock-language');
    });

    it('returns the right data when primarySpokenLanguage is not other', () => {
      const altMember = {
        ...member,
        contactInformation: {
          ...member.contactInformation,
          primarySpokenLanguage: { isOther: false, name: { translation: { en: 'foo' } } },
        },
      };

      expect(householdHelpers.primarySpokenLanguage(altMember as unknown as IMember)).toEqual('foo');
    });
  });

  describe('mobilePhoneNumber', () => {
    it('returns the right data when there is a mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, mobilePhoneNumber: { number: 'mock-number' } } };

      expect(householdHelpers.mobilePhoneNumber(altMember as unknown as IMember)).toEqual('mock-number');
    });

    it('returns the right data when there is no mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, mobilePhoneNumber: { number: '' } } };

      expect(householdHelpers.mobilePhoneNumber(altMember as unknown as IMember)).toEqual('-');
    });
  });

  describe('homePhoneNumber', () => {
    it('returns the right data when there is a mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, homePhoneNumber: { number: 'mock-number' } } };

      expect(householdHelpers.homePhoneNumber(altMember as unknown as IMember)).toEqual('mock-number');
    });

    it('returns the right data when there is no mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, homePhoneNumber: { number: '' } } };

      expect(householdHelpers.homePhoneNumber(altMember as unknown as IMember)).toEqual('-');
    });
  });

  describe('alternatePhoneNumber', () => {
    it('returns the right data when there is a mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { number: 'mock-number' } } };
      expect(householdHelpers.alternatePhoneNumber(altMember as unknown as IMember)).toEqual('mock-number');
    });

    it('returns the right data when there is no mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { number: '' } } };
      expect(householdHelpers.alternatePhoneNumber(altMember as unknown as IMember)).toEqual('-');
    });
  });

  describe('alternatePhoneExtension', () => {
    it('returns the right data when there is a mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { extension: 'mock-number' } } };
      expect(householdHelpers.alternatePhoneExtension(altMember as unknown as IMember)).toEqual('mock-number');
    });

    it('returns the right data when there is no mobile number', () => {
      const altMember = { ...member, contactInformation: { ...member.contactInformation, alternatePhoneNumber: { extension: '' } } };
      expect(householdHelpers.alternatePhoneExtension(altMember as unknown as IMember)).toEqual('-');
    });
  });

  describe('gender', () => {
    it('returns the right data when gender is other', () => {
      const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: 'mock-gender' } };
      expect(householdHelpers.gender(altMember)).toEqual('mock-gender');
    });

    it('returns the right data when gender is not other', () => {
      const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: '' } };
      expect(householdHelpers.gender(altMember)).toEqual(member.identitySet.gender.name.translation.en);
    });
  });

  describe('indigenousIdentity', () => {
    it('returns the right data ', () => {
      const altMember = {
        ...member,
        identitySet: {
          ...member.identitySet,
          indigenousType: EIndigenousTypes.InuitCommunity,
          indigenousCommunityId: mockIndigenousCommunitiesGetData()[0].id,
        },
      };

      expect(householdHelpers.indigenousIdentity(altMember, mockIndigenousCommunitiesGetData()))
        .toEqual(`Inuit Community, ${mockIndigenousCommunitiesGetData()[0].communityName}`);
    });

    it('returns the right data if member has indigenousType other', () => {
      const altMember = {
        ...member,
        identitySet: {
          ...member.identitySet,
          indigenousType: EIndigenousTypes.Other,
          indigenousCommunityOther: 'mock-community',
        },
      };
      expect(householdHelpers.indigenousIdentity(altMember, mockIndigenousCommunitiesGetData()))
        .toEqual('Other, mock-community');
    });

    it('returns a dash if member has no indigenous data', () => {
      const altMember = {
        ...member,
        identitySet: {
          ...member.identitySet,
          indigenousType: null as EIndigenousTypes,
          indigenousCommunityOther: '',
        },
      };
      expect(householdHelpers.indigenousIdentity(altMember, mockIndigenousCommunitiesGetData()))
        .toEqual('-');
    });
  });

  describe('provinceCodeName', () => {
    it('returns the province code if the province is not other', async () => {
      const altHousehold = _cloneDeep(mockCombinedHousehold());
      altHousehold.entity.address.address.province = ECanadaProvinces.QC;
      expect(householdHelpers.provinceCodeName(altHousehold.entity.address.address)).toEqual('QC');
    });

    it('returns the province other name  if the province is  other', async () => {
      const altHousehold = _cloneDeep(mockCombinedHousehold());
      altHousehold.entity.address.address.province = ECanadaProvinces.OT;
      altHousehold.entity.address.address.specifiedOtherProvince = 'mock-other-province';

      expect(householdHelpers.provinceCodeName(altHousehold.entity.address.address)).toEqual('mock-other-province');
    });
  });

  describe('countryName', () => {
    it('should return proper data', () => {
      expect(householdHelpers.countryName('CA')).toEqual('Canada');
    });
  });

  describe('addressLine1', () => {
    it('returns the right data when there is a unit suite ', () => {
      const household = { ...mockHouseholdCreate(), homeAddress: { ...mockHouseholdCreate().homeAddress, unitSuite: '13' } };

      expect(householdHelpers.addressLine1(household as unknown as HouseholdCreate))
        .toEqual(`13-${household.homeAddress.streetAddress}`);
    });

    it('returns the right data when there is no unit suite ', () => {
      const household = mockHouseholdCreate() as unknown as HouseholdCreate;
      expect(householdHelpers.addressLine1(household))
        .toEqual(`${household.homeAddress.streetAddress}`);
    });
  });

  describe('addressLine2', () => {
    it('returns the right data', () => {
      const household = mockHouseholdCreate() as unknown as HouseholdCreate;
      expect(householdHelpers.addressLine2(household))
        .toEqual(`${household.homeAddress.city}, ON, ${household.homeAddress.postalCode}`);
    });
  });

  describe('country', () => {
    it('should return proper data', () => {
      const household = mockHouseholdCreate() as unknown as HouseholdCreate;
      expect(householdHelpers.country(household)).toEqual('Canada');
    });
  });

  describe('getAddressLines', () => {
    it('should return proper data', () => {
      const household = mockHouseholdCreate() as unknown as HouseholdCreate;
      expect(householdHelpers.getAddressLines(household.homeAddress)).toEqual(['247 Some Street', 'Ottawa, ON, K1W 1G7', 'Canada']);
    });
  });

  describe('getBirthDateDisplayWithAge', () => {
    it('should return proper data', () => {
      const birthdate = {
        day: 1,
        month: 12,
        year: 1990,
      };
      libHelpers.getAge = jest.fn(() => 10);
      expect(householdHelpers.getBirthDateDisplayWithAge(birthdate)).toEqual('Dec 1, 1990 (10 years)');
    });
  });

  describe('convertBirthDateStringToObject', () => {
    it('should return proper data', () => {
      expect(householdHelpers.convertBirthDateStringToObject('1990-12-01')).toEqual({
        day: '1',
        year: '1990',
        month: 12,
      });
    });
  });
});
