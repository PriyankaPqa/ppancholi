import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  ETemporaryAddressTypes,
  mockBeneficiary,
} from '@/entities/beneficiary';
import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import utils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import Component from './TempAddressForm.vue';
import 'regenerator-runtime';

const localVue = createLocalVue();
const storage = mockStorage();

describe('TempAddress.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('temporaryAddress', () => {
      it('should be linked to temporaryAddress from beneficiary', () => {
        expect(wrapper.vm.temporaryAddress).toEqual(mockBeneficiary().person.temporaryAddress);
      });
    });

    describe('temporaryAddressType', () => {
      it('should be linked to temporaryAddressType from beneficiary', () => {
        expect(wrapper.vm.temporaryAddressType).toEqual(mockBeneficiary().person.temporaryAddress.temporaryAddressType);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('temporaryAddressTypeItems', () => {
      it('returns the full list of temporary addresses types if noFixedHome is false', async () => {
        await wrapper.setProps({
          noFixedHome: false,
        });
        const list = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual(list);
      });

      it('returns the full list of temporary addresses types without remaining home if noFixedHome is true', async () => {
        await wrapper.setProps({
          noFixedHome: true,
        });
        const list = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
        const filtered = list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual(filtered);
      });
    });

    describe('isCanada', () => {
      it('should return true if country is CA', () => {
        wrapper.vm.form.country = 'CA';
        expect(wrapper.vm.isCanada).toBeTruthy();
      });
    });

    describe('isTemporaryAddressCampground', () => {
      it('should return true if temporary address is Campground', () => {
        // campground is return by default by the mock
        expect(wrapper.vm.isTemporaryAddressCampground).toBeTruthy();
      });
    });

    describe('rules', () => {
      it('should return correct rules', () => {
        expect(wrapper.vm.rules).toEqual({
          temporaryAddressType: {
            required: true,
          },
          country: {
            required: wrapper.vm.temporaryAddress.requiresCountry(),
          },
          street: {
            max: MAX_LENGTH_MD,
          },
          provinceTerritory: {
            required: true,
            max: MAX_LENGTH_SM,
          },
          city: {
            required: wrapper.vm.temporaryAddress.requiresCity(),
            max: MAX_LENGTH_MD,
          },
          postalCode: {
            max: MAX_LENGTH_SM,
            canadianPostalCode: wrapper.vm.isCanada,
          },
          placeName: {
            required: wrapper.vm.temporaryAddress.requiresPlaceName(),
            max: MAX_LENGTH_MD,
          },
          placeNumber: {
            max: MAX_LENGTH_SM,
          },
          unitSuite: {
            max: MAX_LENGTH_SM,
          },
        });
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('setTemporaryAddress is called when form changes', async () => {
        wrapper.vm.form.country = 'test';
        expect(wrapper.vm.$storage.beneficiary.mutations.setTemporaryAddress).toHaveBeenCalledWith(wrapper.vm.form);
      });

      test('autocomplete triggers $streetAddressAutocomplete', async () => {
        wrapper.vm.$streetAddressAutocomplete = jest.fn();
        const element = wrapper.findDataTest('tempAddress__street');
        await element.vm.$emit('on-autocompleted');
        expect(wrapper.vm.$streetAddressAutocomplete).toHaveBeenCalledTimes(1);
      });

      describe('Changing country', () => {
        it('should trigger $onChangeCountry', async () => {
          const element = wrapper.findDataTest('tempAddress__country');
          wrapper.vm.$refs.form = {};
          wrapper.vm.$refs.form.reset = jest.fn();
          jest.spyOn(wrapper.vm, '$onChangeCountry');
          await element.vm.$emit('change');
          expect(wrapper.vm.$onChangeCountry).toHaveBeenCalledTimes(1);
        });
      });

      describe('Reset geo-location', () => {
        it('is triggered when updating city', async () => {
          const element = wrapper.findDataTest('tempAddress__city');
          jest.spyOn(wrapper.vm, '$resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating street', async () => {
          const element = wrapper.findDataTest('tempAddress__street');
          jest.spyOn(wrapper.vm, '$resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating province', async () => {
          const element = wrapper.findDataTest('tempAddress__province');
          jest.spyOn(wrapper.vm, '$resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating postal code', async () => {
          const element = wrapper.findDataTest('tempAddress__postalCode');
          jest.spyOn(wrapper.vm, '$resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.$resetGeoLocation).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Validation rules', () => {
      describe('Country', () => {
        it('is linked to proper rules', async () => {
          const element = wrapper.findDataTest('tempAddress__country');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.country);
        });
      });

      describe('Street', () => {
        it('is linked to proper rules', async () => {
          const element = wrapper.findDataTest('tempAddress__street');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.street);
        });
      });

      describe('Postal Code', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('tempAddress__postalCode');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.postalCode);
        });
      });

      describe('Province or Territory', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('tempAddress__province');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.provinceTerritory);
        });
      });

      describe('City', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('tempAddress__city');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.city);
        });
      });

      describe('Place Name', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('tempAddress__placeName');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.placeName);
        });
      });

      describe('Place Number', () => {
        it('is linked to proper rules', () => {
          const element = wrapper.findDataTest('tempAddress__placeNumber');
          expect(element.props('rules')).toEqual(wrapper.vm.rules.placeNumber);
        });
      });
    });
  });

  describe('Methods', () => {
    describe('rebuildForm', () => {
      const type = ETemporaryAddressTypes.MedicalFacility;

      beforeEach(() => {
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.rebuildForm(type);
      });

      it('calls resetTemporaryAddress with proper param', () => {
        expect(wrapper.vm.$storage.beneficiary.mutations.resetTemporaryAddress).toHaveBeenLastCalledWith(type);
      });

      it('resets the form', () => {
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalledTimes(1);
      });

      it('updates the form with the new temporary address from the store', () => {
        expect(wrapper.vm.form).toEqual(wrapper.vm.temporaryAddress);
      });
    });
  });
});
