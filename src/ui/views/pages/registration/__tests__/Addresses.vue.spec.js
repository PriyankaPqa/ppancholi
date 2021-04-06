import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import AddressForm from '@/ui/views/components/shared/form/AddressForm.vue';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';
import Component from '../Addresses.vue';

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
});
