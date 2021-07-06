import Vuetify from 'vuetify';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';

import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

describe('ReviewRegistration.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('should call fetchCaseFilesInformation', async () => {
        wrapper.vm.fetchCaseFilesInformation = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchCaseFilesInformation).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchCaseFilesInformation', () => {
      it('should call case files search with correct filter', async () => {
        const id = '1';

        await wrapper.vm.fetchCaseFilesInformation(id);

        expect(wrapper.vm.$storage.caseFile.actions.search).toHaveBeenCalledWith({
          filter: {
            Entity: { HouseholdId: id },
          },
        });
      });

      it('should set caseFiles', async () => {
        const id = '1';
        wrapper.vm.$storage.caseFile.actions.search = jest.fn(() => ({ ids: ['1'] }));
        wrapper.vm.$storage.caseFile.getters.getByIds = jest.fn(() => ([]));

        await wrapper.vm.fetchCaseFilesInformation(id);

        expect(wrapper.vm.$storage.caseFile.getters.getByIds).toHaveBeenCalledWith(['1']);
        expect(wrapper.vm.caseFiles).toEqual([]);
      });
    });
  });
});
