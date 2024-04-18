import _cloneDeep from 'lodash/cloneDeep';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { mockMember } from '@libs/entities-lib/household-create';
import { ref } from 'vue';

import { ECanadaProvinces } from '@libs/shared-lib/types';

import { useHouseholdDetails } from './useHouseholdDetails';

describe('useCaseFileDetails', () => {
  describe('getAddressFirstLine', () => {
    it('return the right address information when there is a suite number', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.unitSuite = '100';
      altHousehold.address.address.streetAddress = '200 Left ave';

      const addressFirstLine = useHouseholdDetails(ref(altHousehold), null).getAddressFirstLine();

      expect(addressFirstLine).toEqual('100-200 Left ave');
    });

    it('return the right address information when there is no suite number', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.unitSuite = '';
      altHousehold.address.address.streetAddress = '200 Main ave';

      const addressFirstLine = useHouseholdDetails(ref(altHousehold), null).getAddressFirstLine();

      expect(addressFirstLine).toEqual('200 Main ave');
    });
  });

  describe('getAddressSecondLine', () => {
    it('return the right address information', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.postalCode = 'H2H 2H2';
      altHousehold.address.address.city = 'Montreal';
      altHousehold.address.address.province = ECanadaProvinces.QC;

      const addressSecondLine = useHouseholdDetails(ref(altHousehold), null).getAddressSecondLine();

      expect(addressSecondLine).toEqual('Montreal, QC, H2H 2H2');
    });
  });

  describe('getPrimaryMember', () => {
    it('sets the right beneficiary from the household metadata', async () => {
      const altPersonData = [
        mockMember({ id: 'mock-beneficiary-id', identitySet: { firstName: 'Jane', lastName: 'Doe' } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const primaryMember = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).getPrimaryMember();

      expect(primaryMember).toEqual(altPersonData[0]);
    });
  });

  describe('getPrimaryMemberFullName', () => {
    it('return the beneficiary first and last name', () => {
      const altPersonData = [
        mockMember({ id: 'mock-beneficiary-id', identitySet: { firstName: 'Jane', lastName: 'Doe' } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const primaryMemberFullName = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).getPrimaryMemberFullName();

      expect(primaryMemberFullName).toEqual('Jane Doe');
    });
  });

  describe('hasPhoneNumbers', () => {
    it('return true if the beneficiary has a home phone number', () => {
      const altPersonData = [
        mockMember({
          id: 'mock-beneficiary-id',
          identitySet: { firstName: 'Jane', lastName: 'Doe' },
          contactInformation: {
            homePhoneNumber: {
              number: '514-555-5555',
              extension: '',
            },
            mobilePhoneNumber: null,
            alternatePhoneNumber: null,
          } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const hasPhoneNumbers = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).hasPhoneNumbers();

      expect(hasPhoneNumbers).toBeTruthy();
    });

    it('return true if the beneficiary has a mobile phone number', () => {
      const altPersonData = [
        mockMember({
          id: 'mock-beneficiary-id',
          identitySet: { firstName: 'Jane', lastName: 'Doe' },
          contactInformation: {
            homePhoneNumber: null,
            mobilePhoneNumber: {
              number: '514-555-5555',
              extension: '',
            },
            alternatePhoneNumber: null,
          } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const hasPhoneNumbers = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).hasPhoneNumbers();

      expect(hasPhoneNumbers).toBeTruthy();
    });

    it('return true if the beneficiary has an alternate phone number', () => {
      const altPersonData = [
        mockMember({
          id: 'mock-beneficiary-id',
          identitySet: { firstName: 'Jane', lastName: 'Doe' },
          contactInformation: {
            homePhoneNumber: null,
            mobilePhoneNumber: null,
            alternatePhoneNumber: {
              number: '514-555-5555',
              extension: '',
            },
          } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const hasPhoneNumbers = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).hasPhoneNumbers();

      expect(hasPhoneNumbers).toBeTruthy();
    });

    it('return false if the beneficiary has no phone number', () => {
      const altPersonData = [
        mockMember({
          id: 'mock-beneficiary-id',
          identitySet: { firstName: 'Jane', lastName: 'Doe' },
          contactInformation: {
            homePhoneNumber: null,
            mobilePhoneNumber: null,
            alternatePhoneNumber: null,
          } }),
        mockMember({ id: 'foo', identitySet: { firstName: 'Joe', lastName: 'Dane' } }),
      ];

      const altHousehold = mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' });

      const hasPhoneNumbers = useHouseholdDetails(ref(altHousehold), ref(altPersonData)).hasPhoneNumbers();

      expect(hasPhoneNumbers).toBeFalsy();
    });
  });
});
