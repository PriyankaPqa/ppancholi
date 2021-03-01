import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from './App.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('App.vue', () => {
  let wrapper;
  describe('Methods', () => {
    describe('fetchAllUsersInformation', () => {
      it('calls storage action fetchAllUsers, fetchAppUsers and fetchRoles', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

        jest.clearAllMocks(); // to clear count from created since the method is called there

        await wrapper.vm.fetchAllUsersInformation();

        expect(storage.appUser.actions.fetchAllUsers).toBeCalledTimes(1);
        expect(storage.appUser.actions.fetchAppUsers).toBeCalledTimes(1);
        expect(storage.appUser.actions.fetchRoles).toBeCalledTimes(1);
      });
    });
  });
  describe('Lifecycle', () => {
    describe('Created', () => {
      it('calls fetchAllUsersInformation', async () => {
        const spy = jest.spyOn(Component.methods, 'fetchAllUsersInformation').mockImplementation(() => {});
        wrapper = shallowMount(Component, {
          localVue,
        });
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
