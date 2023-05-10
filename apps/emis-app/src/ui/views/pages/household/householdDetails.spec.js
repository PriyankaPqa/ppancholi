import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import householdDetails from './householdDetails';

const Component = {
  render() {},
  mixins: [householdDetails],
};

const localVue = createLocalVue();
let wrapper;

describe('caseFileDetail mixin', () => {
  const mountWrapper = async (otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      ...otherOptions,
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  describe('addressFirstLine', () => {
    it('return the right address information when there is a suite number', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.unitSuite = '100';
      altHousehold.address.address.streetAddress = '200 Left ave';

      await wrapper.setData({
        household: altHousehold,
      });

      expect(wrapper.vm.addressFirstLine).toEqual('100-200 Left ave');
    });

    it('return the right address information when there is no suite number', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.unitSuite = '';
      altHousehold.address.address.streetAddress = '200 Main ave';

      await wrapper.setData({
        household: altHousehold,
      });
      expect(wrapper.vm.addressFirstLine).toEqual('200 Main ave');
    });
  });

  describe('addressSecondLine', () => {
    it('return the right address information', async () => {
      const altHousehold = _cloneDeep(mockHouseholdEntity());
      altHousehold.address.address.postalCode = 'H2H 2H2';
      altHousehold.address.address.city = 'Montreal';
      altHousehold.address.address.province = ECanadaProvinces.QC;

      await wrapper.setData({
        household: altHousehold,
      });

      expect(wrapper.vm.addressSecondLine).toEqual('Montreal, QC, H2H 2H2');
    });
  });

  describe('primaryBeneficiary', () => {
    it('sets the right beneficiary from the household metadata', async () => {
      const altHousehold = {
        memberMetadata: [
          { id: 'mock-beneficiary-id', firstName: 'Jane', lastName: 'Doe' },
          { id: 'foo', firstName: 'Joe', lastName: 'Dane' },
        ],
      };
      await wrapper.setData({
        householdMetadata: altHousehold,
        household: mockHouseholdEntity({ primaryBeneficiary: 'mock-beneficiary-id' }),
      });

      expect(wrapper.vm.primaryBeneficiary).toEqual({ id: 'mock-beneficiary-id', firstName: 'Jane', lastName: 'Doe' });
    });
  });

  describe('primaryBeneficiaryFullName', () => {
    it('return the beneficiary first and last name', () => {
      mountWrapper({ computed: {
        primaryBeneficiary() {
          return { firstName: 'Jack', lastName: 'White' };
        },
      } });
      expect(wrapper.vm.primaryBeneficiaryFullName).toEqual('Jack White');
    });
  });

  describe('hasPhoneNumbers', () => {
    it('return true if the beneficiary has a home phone number', () => {
      mountWrapper({ computed: {
        primaryBeneficiary() {
          return {
            homePhoneNumber: {
              number: '514-555-5555',
              extension: '',
            },
            mobilePhoneNumber: null,
            alternatePhoneNumber: null,
          };
        },
      } });

      expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
    });

    it('return true if the beneficiary has a mobile phone number', () => {
      mountWrapper({ computed: {
        primaryBeneficiary() {
          return {
            mobilePhoneNumber: {
              number: '514-555-5555',
              extension: '',
            },
            homePhoneNumber: null,
            alternatePhoneNumber: null,
          };
        },
      } });
      expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
    });

    it('return true if the beneficiary has an alternate phone number', () => {
      mountWrapper({
        computed: {
          primaryBeneficiary() {
            return {
              alternatePhoneNumber: {
                number: '514-555-5555',
                extension: '',
              },
              mobilePhoneNumber: null,
              homePhoneNumber: null,
            };
          },
        },
      });

      expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
    });

    it('return false if the beneficiary has no phone number', () => {
      mountWrapper({
        computed: {
          primaryBeneficiary() {
            return {
              alternatePhoneNumber: null,
              mobilePhoneNumber: null,
              homePhoneNumber: null,
            };
          },
        },
      });

      expect(wrapper.vm.hasPhoneNumbers).toBeFalsy();
    });
  });
});
