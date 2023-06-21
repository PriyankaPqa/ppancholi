import { mockAddress } from '@libs/entities-lib/household-create';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { mockCampGround, mockFriendsFamily } from '@libs/entities-lib/src/value-objects/current-address';
import { createLocalVue, shallowMount } from '../../../test/testSetup';
import googleAutocomplete from './address';

const Component = {
  render() {},
  mixins: [googleAutocomplete],
  data() {
    return {
      form: mockAddress(),
    };
  },
};

const localVue = createLocalVue();
let wrapper;

describe('googleAutocomplete', () => {
  describe('Methods', () => {
    wrapper = shallowMount(Component, {
      localVue,
    });

    describe('$streetAddressAutocomplete', () => {
      it('populates the appropriate fields when a fully-populated on-autocomplete event object is passed, and reset unit suite', async () => {
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
        wrapper.vm.form.unitSuite = 'test-1';
        expect(wrapper.vm.form.unitSuite).toEqual('test-1');

        wrapper.vm.$streetAddressAutocomplete(resultObject);

        expect(wrapper.vm.form.country).toEqual(resultObject.country);
        expect(wrapper.vm.form.province).toEqual(ECanadaProvinces[resultObject.province]);
        expect(wrapper.vm.form.specifiedOtherProvince).toBeNull();
        expect(wrapper.vm.form.postalCode).toEqual(resultObject.postalCode);
        expect(wrapper.vm.form.city).toEqual(resultObject.city);
        expect(wrapper.vm.form.streetAddress).toEqual(resultObject.street);
        expect(wrapper.vm.form.latitude).toEqual(resultObject.location.lat);
        expect(wrapper.vm.form.longitude).toEqual(resultObject.location.lng);
        expect(wrapper.vm.form.unitSuite).toEqual(null);

        resultObject.country = 'FR';
        resultObject.province = 'other province';
        wrapper.vm.$streetAddressAutocomplete(resultObject);
        expect(wrapper.vm.form.province).toBeNull();
        expect(wrapper.vm.form.specifiedOtherProvince).toBe('other province');
      });
    });

    describe('$streetCurrentAddressAutocomplete', () => {
      it('should reset place number when address type has place number', async () => {
        await wrapper.setData({
          form: mockCampGround(),
        });
        wrapper.vm.form.requiresPlaceName = jest.fn(() => false);
        wrapper.vm.form.hasPlaceNumber = jest.fn(() => true);
        wrapper.vm.form.placeNumber = '123';
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

        await wrapper.vm.$streetCurrentAddressAutocomplete(resultObject);
        expect(wrapper.vm.form.placeNumber).toEqual(null);
      });

      it('should reset unit suite when address type has unit suite', async () => {
        jest.clearAllMocks();
        await wrapper.setData({
          form: mockFriendsFamily(),
        });
        wrapper.vm.form.requiresPlaceName = jest.fn(() => false);
        wrapper.vm.form.hasPlaceNumber = jest.fn(() => false);
        wrapper.vm.form.hasUnitSuite = jest.fn(() => true);
        wrapper.vm.form.address.unitSuite = '123';
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

        await wrapper.vm.$streetCurrentAddressAutocomplete(resultObject);
        expect(wrapper.vm.form.address.unitSuite).toEqual(null);
      });
    });

    describe('$onInput', () => {
      it('reset geo location if is autocomplete address', async () => {
        const geoLocation = {
          lat: '123',
          lng: '456',
        };

        wrapper.vm.form.geoLocation = geoLocation;
        wrapper.vm.isAutocompleteAddress = true;
        wrapper.vm.$resetGeoLocation();
        expect(wrapper.vm.form.geoLocation).toEqual(geoLocation);

        wrapper.vm.isAutocompleteAddress = false;
        wrapper.vm.$resetGeoLocation();
        expect(wrapper.vm.form.geoLocation).toEqual({
          lat: geoLocation.lat,
          lng: geoLocation.lng,
        });
      });
    });

    describe('$onChangeCountry', () => {
      beforeEach(() => {
        wrapper.vm.form.reset = jest.fn();
        wrapper.vm.$refs.form = {};
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.$onChangeCountry('FR');
      });

      it('calls resetAddress from entity with proper param', () => {
        expect(wrapper.vm.form.reset).toHaveBeenCalledWith('FR');
      });

      it('resets the form', () => {
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalledTimes(1);
      });
    });
  });
});
