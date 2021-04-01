import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { ETemporaryAddressTypes, mockAddresses } from '@/entities/beneficiary';
import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import utils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import Component from '../Addresses.vue';
import 'regenerator-runtime';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Addresses.vue', () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        addresses() {
          return mockAddresses();
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('temporaryAddressTypeItems', () => {
      it('returns the full list of temporary addresses types if noFixedHome is false', async () => {
        wrapper.vm.form.noFixedHome = false;
        const list = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual(list);
      });

      it('returns the full list of temporary addresses types without remaining home if noFixedHome is true', async () => {
        wrapper.vm.form.noFixedHome = true;

        const list = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
        const filtered = list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual(filtered);
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

  describe('Methods', () => {
    describe('streetAddressAutocomplete', () => {
      it('populates the appropriate fields when a fully-populated on-autocomplete event object is passed', async () => {
        const resultObject = {
          country: 'CA',
          province: 'QC',
          postalCode: 'J9A3V6',
          city: 'Gatineau',
          street: '140 boul. des Grives',
          location: {
            lat: 19.4326901,
            lng: -99.1500028,
          },
        };
        wrapper.vm.streetAddressAutocomplete(resultObject);
        expect(wrapper.vm.form.country).toEqual(resultObject.country);
        expect(wrapper.vm.form.provinceTerritory).toEqual(ECanadaProvinces[resultObject.province]);
        expect(wrapper.vm.form.postalCode).toEqual(resultObject.postalCode);
        expect(wrapper.vm.form.city).toEqual(resultObject.city);
        expect(wrapper.vm.form.street).toEqual(resultObject.street);
        expect(wrapper.vm.form.geoLocation).toEqual(resultObject.location);
      });
    });

    describe('prePopulate', () => {
      it('populates the country field with the code for Canada ("CA"), if unset', async () => {
        expect(wrapper.vm.form.country).toEqual('CA');
        wrapper.vm.form.country = 'ON';
        expect(wrapper.vm.form.country).toEqual('ON');
        wrapper.vm.prePopulate();
        expect(wrapper.vm.form.country).toEqual('ON');
        wrapper.vm.form.country = null;
        wrapper.vm.prePopulate();
        expect(wrapper.vm.form.country).toEqual('CA');
      });
    });

    describe('onInput', () => {
      it('reset geo location if is autocomplete address', async () => {
        const geoLocation = {
          lat: '123',
          lng: '456',
        };

        wrapper.vm.form.geoLocation = geoLocation;
        wrapper.vm.isAutocompleteAddress = true;
        wrapper.vm.onInput();
        expect(wrapper.vm.form.geoLocation).toEqual(geoLocation);

        wrapper.vm.isAutocompleteAddress = false;
        wrapper.vm.onInput();
        expect(wrapper.vm.form.geoLocation).toEqual({
          lat: null,
          lng: null,
        });
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('setAddresses is called when form change', async () => {
        wrapper.vm.form.noFixedHome = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$storage.beneficiary.mutations.setAddresses).toHaveBeenCalledWith(wrapper.vm.form);
      });

      test('when on-autocomplete event is emitted, streetAddressAutocomplete is run once', async () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            addresses() {
              return mockAddresses();
            },
          },
        });

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

      test('onInput is trigger when updating value city', async () => {
        wrapper.vm.onInput = jest.fn();
        const element = wrapper.findDataTest('addresses__city');
        await element.vm.$emit('input');

        expect(wrapper.vm.onInput).toHaveBeenCalledTimes(1);
      });
    });

    describe('Life cycle hooks', () => {
      test('data are pre populated in the created method', async () => {
        wrapper.vm.prePopulate = jest.fn();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.prePopulate).toHaveBeenCalledTimes(1);
      });
    });

    describe('Validation rules', () => {
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
});
