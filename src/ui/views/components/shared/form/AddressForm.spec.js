import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockAddress, mockBeneficiary } from '@/entities/beneficiary';
import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import utils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import Component from './AddressForm.vue';
import 'regenerator-runtime';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Address.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        homeAddress() {
          return mockAddress();
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('homeAddress', () => {
      it('should be linked to homeAddress from beneficiary', () => {
        expect(wrapper.vm.homeAddress).toEqual(mockBeneficiary().homeAddress);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('rules', () => {
      test('country', () => {
        expect(wrapper.vm.rules.country).toEqual({
          required: true,
        });
      });

      test('street', () => {
        expect(wrapper.vm.rules.street).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      test('unitSuite', () => {
        expect(wrapper.vm.rules.unitSuite).toEqual({
          max: MAX_LENGTH_SM,
        });
      });

      test('provinceTerritory', () => {
        expect(wrapper.vm.rules.provinceTerritory).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('city', () => {
        expect(wrapper.vm.rules.city).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      test('postalCode', () => {
        expect(wrapper.vm.rules.postalCode).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
          canadianPostalCode: true,
        });
        wrapper.vm.form.country = 'FR';
        wrapper.vm.form.provinceTerritory = '';
        expect(wrapper.vm.rules.postalCode).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
          canadianPostalCode: false,
        });
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('setHomeAddress is called when form changes', async () => {
        wrapper.vm.form.city = 'test';
        expect(wrapper.vm.$storage.beneficiary.mutations.setHomeAddress).toHaveBeenCalledWith(wrapper.vm.form);
      });

      test('autocomplete triggers $streetAddressAutocomplete', async () => {
        wrapper.vm.$streetAddressAutocomplete = jest.fn();
        const element = wrapper.findDataTest('address__street');
        await element.vm.$emit('on-autocompleted');
        expect(wrapper.vm.$streetAddressAutocomplete).toHaveBeenCalledTimes(1);
      });

      describe('Changing country', () => {
        it('should trigger $onChangeCountry', async () => {
          const element = wrapper.findDataTest('address__country');
          wrapper.vm.$refs.form = {};
          wrapper.vm.$refs.form.reset = jest.fn();
          jest.spyOn(wrapper.vm, '$onChangeCountry');
          await element.vm.$emit('change');
          expect(wrapper.vm.$onChangeCountry).toHaveBeenCalledTimes(1);
        });
      });

      describe('Reset geo-location', () => {
        it('is triggered when updating city', async () => {
          const element = wrapper.findDataTest('address__city');
          jest.spyOn(wrapper.vm, '$resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating street', async () => {
          const element = wrapper.findDataTest('address__street');
          jest.spyOn(wrapper.vm, '$resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating province', async () => {
          const element = wrapper.findDataTest('address__province');
          jest.spyOn(wrapper.vm, '$resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating postal code', async () => {
          const element = wrapper.findDataTest('address__postalCode');
          jest.spyOn(wrapper.vm, '$resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Validation rules', () => {
      describe('Country', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('address__country');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.country);
        });
      });

      describe('Street', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('address__street');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.street);
        });
      });

      describe('Postal Code', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('address__postalCode');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.postalCode);
        });
      });

      describe('Province or Territory', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('address__province');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.provinceTerritory);
        });
      });

      describe('City', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('address__city');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.city);
        });
      });
    });
  });
});
