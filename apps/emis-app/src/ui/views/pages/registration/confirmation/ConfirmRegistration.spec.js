import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/storage';
import { tabs } from '@/pinia/registration/tabs';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import Component from './ConfirmRegistration.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const { pinia, registrationStore } = useMockRegistrationStore();

describe('ConfirmRegistrationLib.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
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
        expect(registrationStore.currentTabIndex).toEqual(tabs().findIndex((t) => t.id === 'isRegistered'));
      });

      it('should reset household create', () => {
        wrapper.vm.resetAllTabs = jest.fn();
        wrapper.vm.goToSearch();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });

      it('should reset registration errors', () => {
        registrationStore.registrationErrors = 'errors';
        wrapper.vm.goToSearch();
        expect(registrationStore.registrationErrors).toEqual(null);
      });
    });
  });
});
