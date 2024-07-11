import helpers from '@libs/entities-lib/helpers';
import { EOptionItemStatus } from '@libs/shared-lib/types';
import { mockAddress, mockHouseholdCreate } from '@libs/entities-lib/src/household-create';
import { mockEventSummary } from '@libs/entities-lib/src/event';
import { ECurrentAddressTypes, mockCampGround } from '@libs/entities-lib/src/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AddressesLib.vue';

jest.mock('@libs/registration-lib/components/forms/mixins/useAddresses');
const mockAddressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'RemainingInHome' },
];
useAddresses.mockImplementation(() => ({ getCurrentAddressTypeItems: jest.fn(() => mockAddressTypes) }));
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
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(wrapper.vm.$i18n));
      });
    });

    describe('currentAddressTypeItems', () => {
      it('calls the useAddresses method with the right params ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          propsData: {
            disableAutocomplete: false,
          },
          computed: {
            noFixedHome() {
              return false;
            },
            shelterLocations() {
              return [{ id: 1 }];
            },
          },
        });

        expect(wrapper.vm.getCurrentAddressTypeItems).toHaveBeenCalledWith(wrapper.vm.$i18n, false, true, false);
      });

      it('returns the right value', async () => {
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
            disableAutocomplete: false,
          },
        });

        expect(wrapper.vm.currentAddressTypeItems).toEqual(mockAddressTypes);
      });
    });

    describe('shelterLocations', () => {
      it('should return the active shelterLocations for the current Event', () => {
        const event = mockEventSummary();
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

    it('should pass props isEditMode to AddressForm component', async () => {
      const component = wrapper.findComponent(AddressForm);
      const props = 'isEditMode';
      await wrapper.setProps({
        isEditMode: true,
      });
      expect(component.props(props)).toBe(true);

      await wrapper.setProps({
        isEditMode: false,
      });
      expect(component.props(props)).toBe(false);
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
