import { i18n } from '../../ui/plugins/i18n';
import helpers from '../../ui/helpers';
import { mockStorage } from '../../store/storage/storage.mock';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { EOptionItemStatus } from '../../types';
import { mockAddress, mockHouseholdCreate } from '../../entities/household-create';
import { mockEvent } from '../../entities/event';
import { ECurrentAddressTypes, mockCampGround } from '../../entities/value-objects/current-address';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './Addresses.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const household = mockHouseholdCreate();

describe('Addresses.vue', () => {
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
      },
      mocks: {
        $storage: storage,
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
        expect(wrapper.vm.$storage.household.mutations.setNoFixedHome).toHaveBeenCalledWith(true);
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
      it('returns the full list of temporary addresses types if noFixedHome is false. Remaning home being first', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              apiKey: 'google-api-key',
            };
          },
          propsData: {
            i18n,
          },
          computed: {
            noFixedHome() {
              return false;
            },
          },
        });
        const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n)
          .filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
        expect(wrapper.vm.currentAddressTypeItems).toEqual([
          {
            value: ECurrentAddressTypes.RemainingInHome,
            text: i18n.t('registration.addresses.temporaryAddressTypes.RemainingInHome').toString(),
          },
          ...list,
        ]);
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
          },
        });
        const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);
        const filtered = list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
        expect(wrapper.vm.currentAddressTypeItems).toEqual(filtered);
      });
    });

    describe('shelterLocations', () => {
      it('should return the active shelterLocations for the current Event', () => {
        const event = mockEvent();
        const filtered = event.shelterLocations.filter((s) => s.status === EOptionItemStatus.Active);
        expect(wrapper.vm.shelterLocations).toEqual(filtered);
        expect(wrapper.vm.shelterLocations.filter((s) => s.status === EOptionItemStatus.Inactive)).toHaveLength(0);
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

      it('should call setCurrentAddress mutations', () => {
        wrapper.vm.setCurrentAddress(ECurrentAddressTypes.HotelMotel);
        expect(wrapper.vm.$storage.household.mutations.setCurrentAddress)
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
        expect(wrapper.vm.$storage.household.mutations.setHomeAddress)
          .toHaveBeenCalledWith(mockAddress());
      });
    });
  });
});
