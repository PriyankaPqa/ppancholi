import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { tabs } from '@/store/modules/registration/tabs';
import Component from './ConfirmRegistration.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('ConfirmRegistration.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('goToSearch', () => {
      it('should call resetAllTabs', () => {
        wrapper.vm.resetAllTabs = jest.fn();
        wrapper.vm.goToSearch();
        expect(wrapper.vm.resetAllTabs).toHaveBeenCalledTimes(1);
      });

      it('should call redirect to first page', () => {
        wrapper.vm.resetAllTabs = jest.fn();
        wrapper.vm.goToSearch();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentTabIndex).toHaveBeenCalledWith(tabs().findIndex((t) => t.id === 'isRegistered'));
      });

      it('should reset household create', () => {
        wrapper.vm.resetAllTabs = jest.fn();
        wrapper.vm.goToSearch();
        expect(wrapper.vm.$storage.registration.mutations.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });

      it('should reset registration errors', () => {
        wrapper.vm.resetAllTabs = jest.fn();
        wrapper.vm.goToSearch();
        expect(wrapper.vm.$storage.registration.mutations.setRegistrationErrors).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.registration.mutations.setRegistrationErrors).toHaveBeenCalledWith(null);
      });
    });
  });
});
