import helpers from '@libs/entities-lib/helpers';
import { EOptionItemStatus } from '@libs/shared-lib/types';
import { mockAddress, mockHouseholdCreate } from '@libs/entities-lib/src/household-create';
import { mockEvent } from '@libs/entities-lib/src/registration-event';
import { ECurrentAddressTypes, mockCampGround } from '@libs/entities-lib/src/value-objects/current-address';
import { i18n } from '../../ui/plugins/i18n';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AddressesLib.vue';

const localVue = createLocalVue();
const household = mockHouseholdCreate();

describe('AddressesLib.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      data() {
        return {
          apiKey: 'google-api-key',
        };
      },
      propsData: {
        i18n,
        disableAutocomplete: false,
      },
    });
  });

  describe('Computed', () => {
    describe('noFixedHome', () => {
      it('is linked to household noFixedHome state', () => {
        expect(wrapper.vm.noFixedHome).toBe(household.noFixedHome);
      });

      it('triggers setNoFixedHome mutation when changed', () => {
        wrapper.vm.noFixedHome = true;
        expect(wrapper.vm.$registrationStore.householdCreate.noFixedHome).toBe(true);
      });
    });

    describe('currentAddress', () => {
      it('is linked to temporary address of the household', () => {
        expect(wrapper.vm.currentAddress).toEqual(mockCampGround());
      });
    });

    describe('homeAddress', () => {
      it('should be linked to homeAddress from household', () => {
        expect(wrapper.vm.homeAddress).toEqual(mockHouseholdCreate().homeAddress);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(i18n));
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the full list of temporary addresses types if noFixedHome is false. Remaining home being first', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            noFixedHome() {
              return false;
            },
          },
        });
        const fullList = [
          {
            text: 'Remaining in home',
            value: 1,
          },
          {
            text: 'Campground',
            value: 2,
          },
          {
            text: 'Friends / Family',
            value: 3,
          },
          {
            text: 'Hotel/Motel',
            value: 4,
          },
          {
            text: 'Medical facility',
            value: 5,
          },
          {
            text: 'Other',
            value: 6,
          },
          {
            text: 'Shelter',
            value: 7,
          },
          {
            text: 'Unknown',
            value: 0,
          },
        ];
        expect(wrapper.vm.currentAddressTypeItems).toEqual(fullList);
      });

      it('returns the full list of temporary addresses types without remaining home if noFixedHome is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          computed: {
            noFixedHome() {
              return true;
            },
          },
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
        });
        const listNoRemainingHome = [
          {
            text: 'Campground',
            value: 2,
          },
          {
            text: 'Friends / Family',
            value: 3,
          },
          {
            text: 'Hotel/Motel',
            value: 4,
          },
          {
            text: 'Medical facility',
            value: 5,
          },
          {
            text: 'Other',
            value: 6,
          },
          {
            text: 'Shelter',
            value: 7,
          },
          {
            text: 'Unknown',
            value: 0,
          },
        ];
        expect(wrapper.vm.currentAddressTypeItems).toEqual(listNoRemainingHome);
      });

      it('is hiding shelter from the list if no shelter options are available', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          computed: {
            noFixedHome() {
              return false;
            },
            shelterLocations: () => [],
          },
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
        });
        const listNoShelter = [
          {
            text: 'Remaining in home',
            value: 1,
          },
          {
            text: 'Campground',
            value: 2,
          },
          {
            text: 'Friends / Family',
            value: 3,
          },
          {
            text: 'Hotel/Motel',
            value: 4,
          },
          {
            text: 'Medical facility',
            value: 5,
          },
          {
            text: 'Other',
            value: 6,
          },
          {
            text: 'Unknown',
            value: 0,
          },
        ];
        expect(wrapper.vm.currentAddressTypeItems).toEqual(listNoShelter);
      });
    });

    describe('shelterLocations', () => {
      it('should return the active shelterLocations for the current Event', () => {
        const event = mockEvent();
        const filtered = event.shelterLocations.filter((s) => s.status === EOptionItemStatus.Active);
        expect(wrapper.vm.shelterLocations).toEqual(filtered);
        expect(wrapper.vm.shelterLocations.filter((s) => s.status === EOptionItemStatus.Inactive)).toHaveLength(0);
      });

      it('should add to the locations the current location if there is one', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          computed: {
            currentAddress() {
              return { shelterLocation: { id: 'sl-1' } };
            },
          },
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
        });
        const location = { id: 'sl-event', status: EOptionItemStatus.Active };
        wrapper.vm.$registrationStore.getEvent = jest.fn(() => ({ shelterLocations: [location] }));
        expect(wrapper.vm.shelterLocations).toEqual([{ id: 'sl-1' }, location]);
      });
    });
  });

  describe('Template', () => {
    it('should display CurrentAddressForm component', () => {
      expect(wrapper.findComponent(CurrentAddressForm).exists()).toBeTruthy();
    });

    it('should display AddressForm component', () => {
      expect(wrapper.findComponent(AddressForm).exists()).toBeTruthy();
    });

    it('should hide AddressForm if no fixed home', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        data() {
          return {
            apiKey: 'google-api-key',
          };
        },
        propsData: {
          i18n,
          disableAutocomplete: false,
        },
        computed: {
          noFixedHome() {
            return true;
          },
          shelterLocations() {
            return [];
          },
        },
      });
      expect(wrapper.findComponent(AddressForm).exists()).toBeFalsy();
    });
  });

  describe('Methods', () => {
    describe('setCurrentAddress', () => {
      it('is called when event change is emitted', async () => {
        jest.spyOn(wrapper.vm, 'setCurrentAddress');
        const temp = wrapper.findComponent(CurrentAddressForm);
        await temp.vm.$emit('change', ECurrentAddressTypes.HotelMotel);
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(ECurrentAddressTypes.HotelMotel);
      });

      it('should call setCurrentAddress', () => {
        wrapper.vm.setCurrentAddress(ECurrentAddressTypes.HotelMotel);
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress)
          .toHaveBeenCalledWith(ECurrentAddressTypes.HotelMotel);
      });
    });

    describe('setHomeAddress', () => {
      it('is called when event change is emitted', async () => {
        jest.spyOn(wrapper.vm, 'setHomeAddress');
        const temp = wrapper.findComponent(AddressForm);
        await temp.vm.$emit('change', mockAddress());
        expect(wrapper.vm.setHomeAddress).toHaveBeenCalledWith(mockAddress());
      });

      it('should call setHomeAddress mutations', () => {
        wrapper.vm.setHomeAddress(mockAddress());
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress)
          .toHaveBeenCalledWith(mockAddress());
      });
    });
  });
});
