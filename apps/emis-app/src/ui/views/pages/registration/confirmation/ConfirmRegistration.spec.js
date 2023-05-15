import { createLocalVue, shallowMount } from '@/test/testSetup';

import { tabs } from '@/pinia/registration/tabs';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';

import Component from './ConfirmRegistration.vue';

const localVue = createLocalVue();

const { pinia, registrationStore } = useMockRegistrationStore();

describe('ConfirmRegistrationLib.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
    });
  });

  describe('Methods', () => {
    describe('goToSearch', () => {
      it('should call redirect to first page', () => {
        wrapper.vm.goToSearch();
        expect(registrationStore.currentTabIndex).toEqual(tabs().findIndex((t) => t.id === 'isRegistered'));
      });

      it('should reset household create', () => {
        wrapper.vm.goToSearch();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalled();
        expect(registrationStore.resetTabs).toHaveBeenCalled();
      });

      it('should reset registration errors', () => {
        registrationStore.registrationErrors = 'errors';
        wrapper.vm.goToSearch();
        expect(registrationStore.registrationErrors).toEqual(null);
      });
    });
  });
});
