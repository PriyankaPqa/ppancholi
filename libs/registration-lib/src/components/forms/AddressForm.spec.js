import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import { mockAddress } from '../../../../entities-lib/src/household-create';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';

import Component from './AddressForm.vue';

const localVue = createLocalVue();

describe('AddressForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        apiKey: '1235',
        homeAddress: mockAddress({ province: ECanadaProvinces.ON }),
        canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
        disableAutocomplete: false,
      },
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      test('country', () => {
        expect(wrapper.vm.rules.country).toEqual({
          required: true,
        });
      });

      test('street', () => {
        expect(wrapper.vm.rules.streetAddress).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      test('unitSuite', () => {
        expect(wrapper.vm.rules.unitSuite).toEqual({
          max: MAX_LENGTH_SM,
        });
      });

      test('province', () => {
        wrapper.vm.form.country = 'CA';
        expect(wrapper.vm.rules.province).toEqual({
          required: true,
        });

        wrapper.vm.form.country = 'FR';
        expect(wrapper.vm.rules.province).toEqual({
          required: false,
        });
      });

      test('specifiedOtherProvince', () => {
        wrapper.vm.form.country = 'CA';
        expect(wrapper.vm.rules.specifiedOtherProvince).toEqual({
          required: false,
          max: MAX_LENGTH_SM,
        });

        wrapper.vm.form.country = 'FR';
        expect(wrapper.vm.rules.specifiedOtherProvince).toEqual({
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
        wrapper.vm.form.province = '';
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

      test('change event is emitted when form changes', async () => {
        wrapper.vm.form.city = 'test';
        expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.form]);
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
          expect(element.props('rules')).toEqual(wrapper.vm.rules.streetAddress);
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
          expect(element.props('rules')).toEqual(wrapper.vm.rules.province);
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
