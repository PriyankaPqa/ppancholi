import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { Beneficiary, ETemporaryAddressTypes } from '@/entities/beneficiary';
import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import utils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import _cloneDeep from 'lodash/cloneDeep';
import Component from '../Addresses.vue';
import 'regenerator-runtime';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Addresses.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('temporaryAddressTypeItems', () => {
      it('returns the proper data', async () => {
        const tempAddressItems = wrapper.vm.temporaryAddressTypeItems;
        const tempAddressItemsCopy = _cloneDeep(tempAddressItems);
        tempAddressItemsCopy.shift();
        expect(wrapper.vm.temporaryAddressTypeItems[0].value).toEqual(ETemporaryAddressTypes.RemainingInHome);
        expect(tempAddressItems).toEqual(wrapper.vm.temporaryAddressTypeItems);
        wrapper.vm.form.noFixedHome = true;
        expect(tempAddressItemsCopy).toEqual(wrapper.vm.temporaryAddressTypeItems);
      });
    });

    describe('rules', () => {
      test('country', () => {
        wrapper.vm.form.country = null;
        expect(wrapper.vm.rules.country).toEqual({
          required: true,
        });
      });

      test('street', () => {
        wrapper.vm.form.street = null;
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
          max: MAX_LENGTH_MD,
          canadianPostalCode: true,
        });
        wrapper.vm.form.country = 'FR';
        expect(wrapper.vm.rules.postalCode).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
          canadianPostalCode: false,
        });
      });

      test('temporaryAddressType', () => {
        expect(wrapper.vm.rules.temporaryAddressType).toEqual({
          required: true,
        });
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
      });
    });

    describe('Event handlers', () => {
      test('UpdateEntity event is emitted when form changes', async () => {
        wrapper.vm.form.country = 'test';
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update-entity')).toBeTruthy();
      });

      test('when on-autocomplete event is emitted, streetAddressAutocomplete is run once', async () => {
        wrapper.vm.streetAddressAutocomplete = jest.fn();
        const autoCompleteField = wrapper.vm.$refs.address__street_autocomplete;
        expect(autoCompleteField).toBeDefined();
        wrapper.vm.form.street = '500 rue Sainte-Catherine';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.streetAddressAutocomplete).toHaveBeenCalledTimes(0);
        autoCompleteField.$emit('on-autocompleted');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.streetAddressAutocomplete).toHaveBeenCalledTimes(1);
      });
    });

    describe('Life cycle hooks', () => {
      test('data are pre populated in the created method', async () => {
        wrapper.vm.prepopulate = jest.fn();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.prepopulate).toHaveBeenCalledTimes(1);
      });
    });

    describe('Validation rules', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            beneficiary: new Beneficiary(),
          },
        });
      });

      describe('Country', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('addresses__country');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.country);
        });
      });

      describe('Street', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('addresses__street');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.street);
        });
      });

      describe('Postal Code', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('addresses__postalCode');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.postalCode);
        });
      });

      describe('Province or Territory', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('addresses__province');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.provinceTerritory);
        });
      });

      describe('City', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('addresses__city');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.city);
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('streetAddressAutocomplete', () => {
      it('populates the appropriate fields when a fully-populated on-autocomplete event object is passed', async () => {
        const resultObject = {
          country: 'CA',
          province: 'QC',
          postalCode: 'J9A3V6',
          city: 'Gatineau',
          street: '140 boul. des Grives',
        };
        wrapper.vm.streetAddressAutocomplete(resultObject);
        expect(wrapper.vm.form.country).toEqual(resultObject.country);
        expect(wrapper.vm.form.provinceTerritory).toEqual(ECanadaProvinces[resultObject.province]);
        expect(wrapper.vm.form.postalCode).toEqual(resultObject.postalCode);
        expect(wrapper.vm.form.city).toEqual(resultObject.city);
        expect(wrapper.vm.form.street).toEqual(resultObject.street);
      });
    });

    describe('prepopulate', () => {
      it('populates the country field with the code for Canada ("CA"), if unset', async () => {
        expect(wrapper.vm.form.country).toEqual('CA');
        wrapper.vm.form.country = 'ON';
        expect(wrapper.vm.form.country).toEqual('ON');
        wrapper.vm.prepopulate();
        expect(wrapper.vm.form.country).toEqual('ON');
        wrapper.vm.form.country = null;
        wrapper.vm.prepopulate();
        expect(wrapper.vm.form.country).toEqual('CA');
      });
    });
  });
});
