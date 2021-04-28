import { createLocalVue, shallowMount } from '../../tests/testSetup';
import { ETemporaryAddressTypes, mockBeneficiary, mockCampGround } from '../../entities/beneficiary';

import { mockShelterLocations } from '../../entities/event';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import helpers from '../../ui/helpers';

import Component from './TempAddressForm.vue';
import { ECanadaProvinces } from '../../types';

const localVue = createLocalVue();

describe('TempAddress.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        apiKey: '12345',
        temporaryAddress: mockCampGround(),
        temporaryAddressTypeItems: helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes'),
        canadianProvincesItems: helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'),
        shelterLocations: mockShelterLocations(),
      },
    });
  });

  describe('Computed', () => {
    describe('temporaryAddressType', () => {
      it('should be linked to temporaryAddressType from beneficiary', () => {
        expect(wrapper.vm.temporaryAddressType).toEqual(mockBeneficiary().person.temporaryAddress.temporaryAddressType);
      });
    });

    describe('isCanada', () => {
      it('should return true if country is CA', () => {
        wrapper.vm.form.country = 'CA';
        expect(wrapper.vm.isCanada).toBeTruthy();
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
          shelterId: {
            required: true,
          },
        });
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('change event is emitted when form changes', async () => {
        wrapper.vm.form.street = 'test';
        expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.form]);
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
    describe('changeType', () => {
      const type = ETemporaryAddressTypes.MedicalFacility;

      beforeEach(() => {
        wrapper.vm.form.resetTemporaryAddress = jest.fn();
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.changeType(type);
      });

      it('calls reset from entity with proper param', () => {
        expect(wrapper.vm.form.resetTemporaryAddress).toHaveBeenLastCalledWith(type);
      });

      it('resets the form', () => {
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalledTimes(1);
      });
    });
  });
});
