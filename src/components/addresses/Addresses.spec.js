import { i18n } from '../../ui/plugins/i18n';
import helpers from '../../ui/helpers';
import { mockStorage } from '../../store/storage/storage.mock';
import AddressForm from '../forms/AddressForm.vue';
import TempAddressForm from '../forms/TempAddressForm.vue';
import { ECanadaProvinces, EOptionItemStatus } from '../../types';
import { mockAddress, mockBeneficiary } from '../../entities/beneficiary';
import { mockEvent } from '../../entities/event';
import { ETemporaryAddressTypes, mockCampGround } from '../../entities/value-objects/temporary-address';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './Addresses.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const beneficiary = mockBeneficiary();

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
      it('is linked to beneficiary noFixedHome state', () => {
        expect(wrapper.vm.noFixedHome).toBe(beneficiary.noFixedHome);
      });

      it('triggers setNoFixedHome mutation when changed', () => {
        wrapper.vm.noFixedHome = true;
        expect(wrapper.vm.$storage.beneficiary.mutations.setNoFixedHome).toHaveBeenCalledWith(true);
      });
    });

    describe('temporaryAddress', () => {
      it('is linked to temporary address of the beneficiary', () => {
        expect(wrapper.vm.temporaryAddress).toEqual(mockCampGround());
      });
    });

    describe('homeAddress', () => {
      it('should be linked to homeAddress from beneficiary', () => {
        expect(wrapper.vm.homeAddress).toEqual(mockBeneficiary().homeAddress);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces', i18n));
      });
    });

    describe('temporaryAddressTypeItems', () => {
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
        const list = helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n)
          .filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual([
          {
            value: ETemporaryAddressTypes.RemainingInHome,
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
        const list = helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);
        const filtered = list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
        expect(wrapper.vm.temporaryAddressTypeItems).toEqual(filtered);
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
    it('should display TempAddressForm component', () => {
      expect(wrapper.findComponent(TempAddressForm).exists()).toBeTruthy();
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
    describe('setTemporaryAddress', () => {
      it('is called when event change is emitted', async () => {
        jest.spyOn(wrapper.vm, 'setTemporaryAddress');
        const temp = wrapper.findComponent(TempAddressForm);
        await temp.vm.$emit('change', ETemporaryAddressTypes.HotelMotel);
        expect(wrapper.vm.setTemporaryAddress).toHaveBeenCalledWith(ETemporaryAddressTypes.HotelMotel);
      });

      it('should call setTemporaryAddress mutations', () => {
        wrapper.vm.setTemporaryAddress(ETemporaryAddressTypes.HotelMotel);
        expect(wrapper.vm.$storage.beneficiary.mutations.setTemporaryAddress)
          .toHaveBeenCalledWith(ETemporaryAddressTypes.HotelMotel);
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
        expect(wrapper.vm.$storage.beneficiary.mutations.setHomeAddress)
          .toHaveBeenCalledWith(mockAddress());
      });
    });
  });
});
