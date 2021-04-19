import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import AddressForm from '@/ui/views/components/shared/form/AddressForm.vue';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';
import { ETemporaryAddressTypes, mockCampGround } from '@/entities/value-objects/temporary-address';
import { mockAddress, mockBeneficiary } from '@/entities/beneficiary';
import utils from '@/entities/utils';
import { ECanadaProvinces } from '@/types';
import Component from './Addresses.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Addresses.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Temporary Address', () => {
      test('hide remaining home props is linked to noFixedHome', () => {
        const props = wrapper.findComponent(TempAddressForm).props('hideRemainingHome');
        expect(props).toEqual(wrapper.vm.noFixedHome);
      });
    });
  });

  describe('Computed', () => {
    describe('noFixedHome', () => {
      it('is linked to beneficiary noFixedHome state', () => {
        expect(wrapper.vm.noFixedHome).toBe(false);
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
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
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
        computed: {
          noFixedHome() {
            return true;
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
