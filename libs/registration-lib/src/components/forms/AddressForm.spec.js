import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { mockAddress } from '@libs/entities-lib/src/household-create';
import { createLocalVue, shallowMount } from '../../test/testSetup';
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
          max: MAX_LENGTH_SM,
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
        wrapper.vm.streetAddressAutocomplete = jest.fn();
        const element = wrapper.findDataTest('address_autocomplete');
        await element.vm.$emit('on-autocompleted');
        expect(wrapper.vm.streetAddressAutocomplete).toHaveBeenCalledTimes(1);
      });

      describe('Changing country', () => {
        it('should trigger onChangeCountry', async () => {
          const element = wrapper.findDataTest('address__country');
          wrapper.vm.$refs.form = {};
          wrapper.vm.$refs.form.reset = jest.fn();
          jest.spyOn(wrapper.vm, 'onChangeCountry');
          await element.vm.$emit('change');
          expect(wrapper.vm.onChangeCountry).toHaveBeenCalledTimes(1);
        });
      });

      describe('address__street', () => {
        it('should call formatAddressInput with proper value when keyup', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              apiKey: '1235',
              homeAddress: mockAddress({ streetAddress: 'abc abc abc' }),
              canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
              disableAutocomplete: false,
            },
            data() {
              return {
                form: {
                  streetAddress: 'abc abc abc',
                },
              };
            },
          });
          wrapper.vm.formatAddressInput = jest.fn();
          const element = wrapper.findDataTest('address__street');
          await element.vm.$emit('keyup');
          expect(wrapper.vm.formatAddressInput).toHaveBeenCalledWith('streetAddress');
        });
      });
      describe('address__city', () => {
        it('should call formatAddressInput with proper value when keyup', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              apiKey: '1235',
              homeAddress: mockAddress({ city: 'abc abc abc' }),
              canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
              disableAutocomplete: false,
            },
            data() {
              return {
                form: {
                  city: 'abc abc abc',
                },
              };
            },
          });
          wrapper.vm.formatAddressInput = jest.fn();
          const element = wrapper.findDataTest('address__city');
          await element.vm.$emit('keyup');
          expect(wrapper.vm.formatAddressInput).toHaveBeenCalledWith('city');
        });
      });

      describe('address__postalCode', () => {
        it('should uppercase the value when keyup', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              apiKey: '1235',
              homeAddress: mockAddress({ postalCode: 'abc' }),
              canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
              disableAutocomplete: false,
            },
            data() {
              return {
                form: {
                  postalCode: 'abc',
                },
              };
            },
          });
          const element = wrapper.findDataTest('address__postalCode');
          await element.vm.$emit('keyup');
          expect(wrapper.vm.form.postalCode).toEqual('ABC');
        });
      });

      describe('Reset geo-location', () => {
        it('is triggered when updating city', async () => {
          const element = wrapper.findDataTest('address__city');
          jest.spyOn(wrapper.vm, 'resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating street', async () => {
          const element = wrapper.findDataTest('address__street');
          jest.spyOn(wrapper.vm, 'resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating province', async () => {
          const element = wrapper.findDataTest('address__province');
          jest.spyOn(wrapper.vm, 'resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating postal code', async () => {
          const element = wrapper.findDataTest('address__postalCode');
          jest.spyOn(wrapper.vm, 'resetGeoLocation');
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('triggers resetGeoLocationInEditMode when is in edit mode', async () => {
          const elementCity = wrapper.findDataTest('address__city');
          const elementStreet = wrapper.findDataTest('address__street');
          const elementProvince = wrapper.findDataTest('address__province');
          const elementPostalCode = wrapper.findDataTest('address__postalCode');
          wrapper.vm.resetGeoLocationInEditMode = jest.fn();
          await wrapper.setProps({
            isEditMode: true,
          });
          await elementCity.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocationInEditMode).toHaveBeenCalled();

          await elementStreet.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocationInEditMode).toHaveBeenCalled();

          await elementProvince.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocationInEditMode).toHaveBeenCalled();

          await elementPostalCode.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocationInEditMode).toHaveBeenCalled();
        });

        it('triggers resetGeoLocation when is not in edit mode', async () => {
          const elementCity = wrapper.findDataTest('address__city');
          const elementStreet = wrapper.findDataTest('address__street');
          const elementProvince = wrapper.findDataTest('address__province');
          const elementPostalCode = wrapper.findDataTest('address__postalCode');
          jest.spyOn(wrapper.vm, 'resetGeoLocation');
          await wrapper.setProps({
            isEditMode: false,
          });
          await elementCity.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalled();

          await elementStreet.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalled();

          await elementProvince.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalled();

          await elementPostalCode.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalled();
        });
      });

      test('change event is emitted when form changes', async () => {
        wrapper.vm.form.city = 'Ottawa';
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

  describe('Methods', () => {
    describe('resetGeoLocationInEditMode', () => {
      it('should call resetGeoLocation when isSameGeoLocation is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            apiKey: '1235',
            homeAddress: mockAddress({ province: ECanadaProvinces.ON }),
            canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
            disableAutocomplete: false,
          },
          computed: {
            isSameGeoLocation: () => false,
          },
        });
        wrapper.vm.resetGeoLocation = jest.fn();
        wrapper.vm.resetGeoLocationInEditMode();
        expect(wrapper.vm.resetGeoLocation).toHaveBeenCalled();
      });
    });

    describe('formatAddressInput', () => {
      it('should format string properly', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            apiKey: '1235',
            homeAddress: mockAddress({ city: 'abc abc abc' }),
            canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
            disableAutocomplete: false,
          },
          data() {
            return {
              form: {
                city: 'abc abc abc',
              },
            };
          },
        });
        wrapper.vm.formatAddressInput('city');
        expect(wrapper.vm.form.city).toEqual('Abc Abc Abc');
      });
    });
  });

  describe('watcher', () => {
    it('should emit onChange event with proper payload', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          apiKey: '1235',
          homeAddress: mockAddress({ province: ECanadaProvinces.ON }),
          canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
          disableAutocomplete: false,
        },
        data() {
          return {
            form: mockAddress({ province: ECanadaProvinces.ON }),
            backUpForm: mockAddress({ province: ECanadaProvinces.ON }),
          };
        },
      });
      await wrapper.setData({
        form: mockAddress({ province: ECanadaProvinces.QC }),
      });
      expect(wrapper.emitted('change')[0][0]).toEqual(wrapper.vm.form);

      await wrapper.setData({
        form: mockAddress({ province: ECanadaProvinces.ON }),
      });
      expect(wrapper.emitted('change')[0][0]).toEqual(wrapper.vm.backUpForm);

      await wrapper.setData({
        form: mockAddress({ unitSuite: '309' }),
      });
      expect(wrapper.emitted('change')[0][0]).toEqual(wrapper.vm.form);
    });
  });
});
