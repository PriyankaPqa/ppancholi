import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/src/helpers';
import {
  ECurrentAddressTypes,
  mockHouseholdCreate,
  mockCampGround,
  mockShelter,
  mockUnknown,
  mockRemainingHome,
  mockFriendsFamily,
  mockMedicalFacility,
  mockOther,
} from '@libs/entities-lib/src/household-create';

import { mockShelterLocations } from '@libs/entities-lib/src/event';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';

import Component from './CurrentAddressForm.vue';

const localVue = createLocalVue();
let wrapper;

const doMount = (currentAddress = mockCampGround(), computed = {}, featureList = [], otherOptions = {}) => {
  const options = {
    localVue,
    computed,
    featureList,
    propsData: {
      apiKey: '12345',
      currentAddress,
      currentAddressTypeItems: helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes'),
      canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
      shelterLocations: mockShelterLocations(),
      noFixedHome: false,
      disableAutocomplete: false,
    },
    ...otherOptions,
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
      it('should return correct rules', async () => {
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
            max: MAX_LENGTH_SM,
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
            required: false,
          },
          unitSuite: {
            max: MAX_LENGTH_SM,
          },
          shelterLocation: {
            required: true,
          },
        });

        await doMount(mockCampGround(), {}, [wrapper.vm.$featureKeys.Lodging]);
        expect(wrapper.vm.rules.placeNumber.required).toBeFalsy();

        await doMount(mockCampGround({ crcProvided: true }), {}, [wrapper.vm.$featureKeys.Lodging]);
        expect(wrapper.vm.rules.placeNumber.required).toBeTruthy();
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

      test('autocomplete triggers streetCurrentAddressAutocomplete', async () => {
        wrapper.vm.streetCurrentAddressAutocomplete = jest.fn();
        const element = wrapper.findDataTest('temporary_address_autocomplete');
        await element.vm.$emit('on-autocompleted');
        expect(wrapper.vm.streetCurrentAddressAutocomplete).toHaveBeenCalledTimes(1);
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
          jest.spyOn(wrapper.vm, 'resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating street', async () => {
          const element = wrapper.findDataTest('tempAddress__street');
          jest.spyOn(wrapper.vm, 'resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating province', async () => {
          const element = wrapper.findDataTest('tempAddress__province');
          jest.spyOn(wrapper.vm, 'resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });

        it('is triggered when updating postal code', async () => {
          const element = wrapper.findDataTest('tempAddress__postalCode');
          jest.spyOn(wrapper.vm, 'resetGeoLocation').mockImplementation(() => null);
          await element.vm.$emit('input');
          expect(wrapper.vm.resetGeoLocation).toHaveBeenCalledTimes(1);
        });
      });

      describe('tempAddress__shelterLocation', () => {
        it('should reset place number when shelter changed', async () => {
          doMount(mockShelter(), {
            currentShelterLocations: () => mockShelterLocations(),
          });
          const element = wrapper.findDataTest('tempAddress__shelterLocation');
          await wrapper.setData({
            form: mockShelter(),
          });
          wrapper.vm.form.placeNumber = '123';
          wrapper.vm.form.requiresShelterLocation = jest.fn(() => true);
          await element.vm.$emit('change');
          expect(wrapper.vm.form.placeNumber).toEqual(null);
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

    describe('tempAddress__postalCode', () => {
      it('should uppercase the value', async () => {
        doMount(mockCampGround({
          address: {
            postalCode: 'abc',
          },
        }), {
          data() {
            return {
              form: {
                address: {
                  postalCode: 'abc',
                },
              },
            };
          },
        });
        const element = wrapper.findDataTest('tempAddress__postalCode');
        await element.vm.$emit('keyup');
        expect(wrapper.vm.form.address.postalCode).toEqual('ABC');
      });
    });

    describe('tempAddress__city', () => {
      it('should call formatAddressInput when keyup', async () => {
        doMount();
        wrapper.vm.formatAddressInput = jest.fn();
        const element = wrapper.findDataTest('tempAddress__city');
        await element.vm.$emit('keyup');
        expect(wrapper.vm.formatAddressInput).toHaveBeenLastCalledWith('city', 'address');
      });
    });

    describe('tempAddress__street', () => {
      it('should call formatAddressInput when keyup', async () => {
        doMount();
        wrapper.vm.formatAddressInput = jest.fn();
        const element = wrapper.findDataTest('tempAddress__street');
        await element.vm.$emit('keyup');
        expect(wrapper.vm.formatAddressInput).toHaveBeenLastCalledWith('streetAddress', 'address');
      });
    });

    describe('tempAddress__placeName', () => {
      it('should call formatAddressInput when keyup', async () => {
        doMount();
        wrapper.vm.formatAddressInput = jest.fn();
        const element = wrapper.findDataTest('tempAddress__placeName');
        await element.vm.$emit('keyup');
        expect(wrapper.vm.formatAddressInput).toHaveBeenLastCalledWith('placeName');
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should set value properly when component created', async () => {
        const mockCurrentAddress = mockCampGround();
        mockCurrentAddress.checkIn = '2023-05-01';
        mockCurrentAddress.checkOut = '2023-05-20';
        await wrapper.setProps({
          currentAddress: mockCurrentAddress,
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.form).toEqual(mockCurrentAddress);
        expect(wrapper.vm.checkInCheckOutDate).toEqual(['2023-05-01', '2023-05-20']);
      });

      it('extend stay - should set value properly when component created for newCheckOutDate', async () => {
        const mockCurrentAddress = mockCampGround();
        mockCurrentAddress.checkIn = '2023-05-01';
        mockCurrentAddress.checkOut = '2023-05-20';
        await wrapper.setProps({
          currentAddress: mockCurrentAddress,
          extendStayMode: true,
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.form).toEqual(mockCurrentAddress);
        expect(wrapper.vm.checkInCheckOutDate).toEqual(['2023-05-01', '2023-05-20']);
        expect(wrapper.vm.newCheckOutDate).toEqual(['2023-05-21', null]);
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

      it('should reset checkInCheckOutDate', () => {
        wrapper.vm.changeType(type);
        expect(wrapper.vm.checkInCheckOutDate).toEqual([null, null]);
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

    describe('setCheckInCheckOut', () => {
      it('should set value properly', () => {
        wrapper.vm.setCheckInCheckOut(['2023-05-01', '2023-05-20']);
        expect(wrapper.vm.form.checkIn).toEqual('2023-05-01');
        expect(wrapper.vm.form.checkOut).toEqual('2023-05-20');
        expect(wrapper.vm.checkInCheckOutDate).toEqual(['2023-05-01', '2023-05-20']);
      });
    });

    describe('setNewCheckOut', () => {
      it('should set value properly', () => {
        wrapper.vm.setNewCheckOut(['2023-05-01', '2023-05-20']);
        expect(wrapper.vm.form.checkIn).not.toEqual('2023-05-01');
        expect(wrapper.vm.form.checkOut).toEqual('2023-05-20');
        expect(wrapper.vm.newCheckOutDate).toEqual(['2023-05-01', '2023-05-20']);

        wrapper.vm.setNewCheckOut(['2023-05-01', '']);
        expect(wrapper.vm.form.checkIn).not.toEqual('2023-05-01');
        expect(wrapper.vm.form.checkOut).not.toEqual('2023-05-20');
        expect(wrapper.vm.form.checkOut).toEqual(wrapper.vm.checkInCheckOutDate[1]);
        expect(wrapper.vm.newCheckOutDate).toEqual(['2023-05-01', '']);
      });
    });

    describe('formatAddressInput', () => {
      it('should format string with path properly', () => {
        doMount(mockCampGround({
          address: {
            city: 'abc abc abc',
          },
        }), {
          data() {
            return {
              form: {
                address: {
                  city: 'abc abc abc',
                },
              },
            };
          },
        });
        wrapper.vm.formatAddressInput('city', 'address');
        expect(wrapper.vm.form.address.city).toEqual('Abc Abc Abc');
      });

      it('should format string without path properly', () => {
        doMount(mockCampGround({
          placeName: 'abc abc abc',
        }), {
          data() {
            return {
              form: {
                placeName: 'abc abc abc',
              },
            };
          },
        });
        wrapper.vm.formatAddressInput('placeName');
        expect(wrapper.vm.form.placeName).toEqual('Abc Abc Abc');
      });
    });
  });
});
