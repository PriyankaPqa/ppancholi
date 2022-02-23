/**
 * @group ui/components/household
 */

import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { mockAddressData, Address } from '@crctech/registration-lib/src/entities/value-objects/address';
import { mockAddress, mockHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { AddressForm } from '@crctech/registration-lib';
import { mockHouseholdEntity } from '@crctech/registration-lib/src/entities/household';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import Component from '../EditHouseholdAddressDialog.vue';
import { i18n } from '@/ui/plugins';
import { MAX_LENGTH_LG } from '@/constants/validations';
import { mockStorage } from '@/store/storage';

const storage = mockStorage();

const localVue = createLocalVue();

describe('EditHouseholdAddressDialog.vue', () => {
  let wrapper;

  const doMount = (mountMode = false) => {
    const options = {
      localVue,
      propsData: {
        show: true,
      },
      mocks: {
        $storage: storage,
      },
      data() {
        return {
          apiKey: 'apiKey',
        };
      },
    };
    if (mountMode) {
      wrapper = mount(Component, options);
    } else {
      wrapper = shallowMount(Component, options);
    }
  };

  describe('Template', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('AddressForm', () => {
      it('should be displayed if no fixed home is false', async () => {
        await wrapper.setData({ noFixedHome: false });
        expect(wrapper.findComponent(AddressForm).exists()).toBe(true);
      });

      it('should trigger setAddress event @change', async () => {
        await wrapper.setData({ noFixedHome: false });
        wrapper.vm.setAddress = jest.fn();
        const component = wrapper.findComponent(AddressForm);
        await component.vm.$emit('change');
        expect(wrapper.vm.setAddress).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      doMount();
    });

    describe('canadianProvincesItems', () => {
      it('should return canadian provinces without other', () => {
        const expected = libHelpers.getCanadianProvincesWithoutOther(i18n);
        expect(wrapper.vm.canadianProvincesItems).toEqual(expected);
      });
    });

    describe('rules', () => {
      it('should have proper rules for noFixedHomeDetails', () => {
        expect(wrapper.vm.rules.noFixedHomeDetails).toEqual({
          max: MAX_LENGTH_LG,
        });
      });
    });

    describe('hasChanged', () => {
      it('should return true if home address has changed', async () => {
        expect(wrapper.vm.hasChanged).toBe(false);

        await wrapper.setData({
          address: {},
        });

        expect(wrapper.vm.hasChanged).toBe(true);
      });

      it('should return true if no fixed home has changed', async () => {
        expect(wrapper.vm.hasChanged).toBe(false);

        await wrapper.setData({
          noFixedHome: !wrapper.vm.noFixedHome,
        });

        expect(wrapper.vm.hasChanged).toBe(true);
      });

      it('should return true if the observation has changed', async () => {
        expect(wrapper.vm.hasChanged).toBe(false);

        await wrapper.setData({
          noFixedHomeDetails: 'test',
        });

        expect(wrapper.vm.hasChanged).toBe(true);
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
        doMount(false);
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
        doMount(false);
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('Watcher', () => {
    beforeEach(() => {
      doMount();
    });
    describe('noFixedHome', () => {
      it('should call setAddress with null if unchecked', async () => {
        wrapper.vm.setAddress = jest.fn();
        await wrapper.setData({ noFixedHome: true });
        await wrapper.setData({ noFixedHome: false });
        expect(wrapper.vm.setAddress).toHaveBeenLastCalledWith(null);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount();
    });

    describe('Created', () => {
      it('should load address from the store', () => {
        expect(wrapper.vm.address).toEqual(mockHouseholdCreate().homeAddress);
      });

      it('should load noFixedHome from the store', () => {
        expect(wrapper.vm.noFixedHome).toEqual(mockHouseholdCreate().noFixedHome);
      });

      it('should load noFixedHomeDetails from the store', () => {
        expect(wrapper.vm.noFixedHomeDetails).toEqual(mockHouseholdEntity().address.observation);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount();
    });

    describe('submit', () => {
      it('should validate the form', () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        wrapper.vm.submit();
        expect(wrapper.vm.$refs.form.validate).toBeCalled();
      });

      it('should call updateNoFixedHomeAddress if no fixed home', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.updateNoFixedHomeAddress = jest.fn();
        await wrapper.setData({ noFixedHome: true });

        await wrapper.vm.submit();

        expect(wrapper.vm.updateNoFixedHomeAddress).toBeCalled();
      });

      it('should call updateHomeAddress otherwise', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.updateHomeAddress = jest.fn();
        await wrapper.setData({ noFixedHome: false });

        await wrapper.vm.submit();

        expect(wrapper.vm.updateHomeAddress).toBeCalled();
      });

      it('should close the dialog in case of success', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.close = jest.fn();

        await wrapper.vm.submit();

        expect(wrapper.vm.close).toBeCalled();
      });
    });

    describe('updateNoFixedHomeAddress', () => {
      it('call updateNoFixedHomeAddress action', async () => {
        const id = '1';
        const observation = 'test';
        await wrapper.vm.updateNoFixedHomeAddress(id, observation);
        expect(wrapper.vm.$storage.household.actions.updateNoFixedHomeAddress).toHaveBeenCalledWith(id, observation);
      });

      it('call setNoFixedHome mutations with true', async () => {
        const id = '1';
        await wrapper.vm.updateNoFixedHomeAddress(id);
        expect(wrapper.vm.$storage.registration.mutations.setNoFixedHome).toHaveBeenCalledWith(true);
      });
    });

    describe('updateHomeAddress', () => {
      it('call updateHomeAddress action', async () => {
        const id = '1';
        const address = mockAddress();
        await wrapper.vm.updateHomeAddress(id, address);
        expect(wrapper.vm.$storage.household.actions.updateHomeAddress).toHaveBeenCalledWith(id, address);
      });

      it('call setNoFixedHome mutations with false', async () => {
        const id = '1';
        const address = mockAddress();
        await wrapper.vm.updateHomeAddress(id, address);
        expect(wrapper.vm.$storage.registration.mutations.setNoFixedHome).toHaveBeenCalledWith(false);
      });

      it('call setHomeAddress mutations with address', async () => {
        const id = '1';
        const address = mockAddress();
        await wrapper.vm.updateHomeAddress(id, address);
        expect(wrapper.vm.$storage.registration.mutations.setHomeAddress).toHaveBeenCalledWith(address);
      });
    });

    describe('cancel', () => {
      it('should call close', async () => {
        wrapper.vm.close = jest.fn();
        await wrapper.vm.cancel();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });
    });

    describe('close', () => {
      it('should update show to false', async () => {
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('setAddress', () => {
      it('should set the address', async () => {
        await wrapper.setData({
          address: {},
        });

        wrapper.vm.setAddress(mockAddressData());

        const expected = new Address(mockAddressData());

        expect(wrapper.vm.address).toEqual(expected);
      });
    });
  });
});
