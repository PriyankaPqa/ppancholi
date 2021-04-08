import { createLocalVue, shallowMount } from '@/test/testSetup';
import googleAutocomplete from '@/ui/mixins/address';
import { ECanadaProvinces } from '@/types';
import { mockAddress } from '@/entities/beneficiary';

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
        wrapper.vm.$streetAddressAutocomplete(resultObject);

        expect(wrapper.vm.form.country).toEqual(resultObject.country);
        expect(wrapper.vm.form.provinceTerritory).toEqual(ECanadaProvinces[resultObject.province]);
        expect(wrapper.vm.form.postalCode).toEqual(resultObject.postalCode);
        expect(wrapper.vm.form.city).toEqual(resultObject.city);
        expect(wrapper.vm.form.street).toEqual(resultObject.street);
        expect(wrapper.vm.form.geoLocation).toEqual(resultObject.location);
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
          lat: null,
          lng: null,
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
