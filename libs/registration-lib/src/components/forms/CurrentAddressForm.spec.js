import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/src/helpers';
import {
  ECurrentAddressTypes, mockHouseholdCreate, mockCampGround, mockShelter, mockUnknown, mockRemainingHome, mockFriendsFamily, mockMedicalFacility, mockOther,
} from '@libs/entities-lib/src/household-create';

import { mockShelterLocations } from '@libs/entities-lib/src/registration-event';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';

import Component from './CurrentAddressForm.vue';

const localVue = createLocalVue();
let wrapper;

const doMount = (currentAddress = mockCampGround(), computed = {}) => {
  const options = {
    localVue,
    computed,
    propsData: {
      apiKey: '12345',
      currentAddress,
      currentAddressTypeItems: helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes'),
      canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
      shelterLocations: mockShelterLocations(),
      noFixedHome: false,
      disableAutocomplete: false,
    },
    mocks: {
      $hasFeature: jest.fn(),
    },
  };

  wrapper = shallowMount(Component, options);
};
describe('CurrentAddressForm.vue', () => {
  beforeEach(() => {
    doMount();
  });

  describe('Computed', () => {
    describe('currentShelterLocations', () => {
      it('should filter on active items', async () => {
        expect(wrapper.vm.currentShelterLocations).toEqual(mockShelterLocations());
        const newLocations = mockShelterLocations();
        newLocations[0].status = 0;

        await wrapper.setProps({ shelterLocations: newLocations });
        expect(wrapper.vm.currentShelterLocations.length).toEqual(newLocations.length - 1);
      });

      it('should include inactive shelters if the current data uses it', async () => {
        const newLocations = mockShelterLocations();
        newLocations[0].status = 0;
        await wrapper.setProps({ shelterLocations: newLocations });
        expect(wrapper.vm.currentShelterLocations.length).toEqual(newLocations.length - 1);
        const shelter = mockShelter();
        shelter.shelterLocation.id = newLocations[0].id;
        await wrapper.setProps({ currentAddress: shelter });
        expect(wrapper.vm.currentShelterLocations.length).toEqual(newLocations.length);
      });
    });

    describe('addressType', () => {
      it('should be linked to addressType from household', () => {
        expect(wrapper.vm.addressType).toEqual(mockHouseholdCreate().primaryBeneficiary.currentAddress.addressType);
      });
    });

    describe('isCanada', () => {
      it('should return true if country is CA', () => {
        wrapper.vm.form.address.country = 'CA';
        expect(wrapper.vm.isCanada).toBeTruthy();
      });
    });

    describe('rules', () => {
      it('should return correct rules', () => {
        expect(wrapper.vm.rules).toEqual({
          addressType: {
            required: true,
          },
          country: {
            required: wrapper.vm.currentAddress.requiresCountry(),
          },
          streetAddress: {
            max: MAX_LENGTH_MD,
          },
          province: {
            required: true,
          },
          specifiedOtherProvince: {
            max: MAX_LENGTH_SM,
            required: false,
          },
          city: {
            required: wrapper.vm.currentAddress.requiresCity(),
            max: MAX_LENGTH_MD,
          },
          postalCode: {
            max: MAX_LENGTH_SM,
            canadianPostalCode: wrapper.vm.isCanada,
          },
          placeName: {
            required: wrapper.vm.currentAddress.requiresPlaceName(),
            max: MAX_LENGTH_MD,
          },
          placeNumber: {
            max: MAX_LENGTH_SM,
          },
          unitSuite: {
            max: MAX_LENGTH_SM,
          },
          shelterLocation: {
            required: true,
          },
        });
      });
    });

    describe('predictionTypes', () => {
      it('should return correct types for Unknown', () => {
        doMount(mockUnknown());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for RemainingInHome', () => {
        doMount(mockRemainingHome());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for Campground', () => {
        doMount(mockCampGround());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for FriendsFamily', () => {
        doMount(mockFriendsFamily());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for MedicalFacility', () => {
        doMount(mockMedicalFacility());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for Other', () => {
        doMount(mockOther());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });

      it('should return correct types for Shelter', () => {
        doMount(mockShelter());
        expect(wrapper.vm.predictionTypes).toEqual(null);
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('change event is emitted when form changes', async () => {
        wrapper.vm.form.address.streetAddress = 'test';
        expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.form]);
      });

      test('autocomplete triggers $streetCurrentAddressAutocomplete', async () => {
        wrapper.vm.$streetCurrentAddressAutocomplete = jest.fn();
        const element = wrapper.findDataTest('temporary_address_autocomplete');
        await element.vm.$emit('on-autocompleted');
        expect(wrapper.vm.$streetCurrentAddressAutocomplete).toHaveBeenCalledTimes(1);
      });

      describe('Changing country', () => {
        it('should trigger onCountryChange', async () => {
          const element = wrapper.findDataTest('tempAddress__country');
          wrapper.vm.$refs.form = {};
          wrapper.vm.$refs.form.reset = jest.fn();
          jest.spyOn(wrapper.vm, 'onCountryChange');
          await element.vm.$emit('change');
          expect(wrapper.vm.onCountryChange).toHaveBeenCalledTimes(1);
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
          expect(element.props('rules')).toEqual(wrapper.vm.rules.streetAddress);
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
          expect(element.props('rules')).toEqual(wrapper.vm.rules.province);
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

    describe('crc_provided_check_in_check_out', () => {
      it('should be rendered when showCrcProvidedAndCheckInCheckOut is true', async () => {
        await wrapper.setProps({
          showCrcProvidedAndCheckInCheckOut: true,
        });
        const element = wrapper.findDataTest('crc_provided_check_in_check_out');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when showCrcProvidedAndCheckInCheckOut is false', async () => {
        await wrapper.setProps({
          showCrcProvidedAndCheckInCheckOut: false,
        });
        const element = wrapper.findDataTest('crc_provided_check_in_check_out');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('changeType', () => {
      const type = ECurrentAddressTypes.MedicalFacility;

      beforeEach(() => {
        wrapper.vm.form.reset = jest.fn();
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.changeType(type);
      });

      it('calls reset from entity with proper param', () => {
        expect(wrapper.vm.form.reset).toHaveBeenLastCalledWith(type);
      });

      it('resets the form', () => {
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalledTimes(1);
      });
    });

    describe('onCountryChange', () => {
      beforeEach(() => {
        wrapper.vm.form.reset = jest.fn();
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.onCountryChange();
      });

      it('reset the address but preserve place name and country', () => {
        expect(wrapper.vm.form.reset).toHaveBeenLastCalledWith(wrapper.vm.form.addressType, true, 'CA');
      });

      it('resets the form', () => {
        expect(wrapper.vm.$refs.form.reset).toHaveBeenCalledTimes(1);
      });
    });
  });
});
