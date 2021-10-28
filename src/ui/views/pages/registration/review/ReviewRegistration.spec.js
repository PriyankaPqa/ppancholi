import Vuetify from 'vuetify';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household';
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
    storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());

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
      it('should call fetchCaseFilesInformation if we have an id', async () => {
        jest.clearAllMocks();
        const h = storage.registration.getters.householdCreate();
        h.id = '123';
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            household() {
              return h;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.fetchCaseFilesInformation = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchCaseFilesInformation).toHaveBeenCalledTimes(1);

        h.id = null;
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            household() {
              return h;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.fetchCaseFilesInformation = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchCaseFilesInformation).not.toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('fetchCaseFilesInformation', () => {
      it('calls household actions fetch', () => {
        wrapper.vm.fetchCaseFilesInformation();
        expect(storage.household.actions.fetch).toHaveBeenCalled();
      });

      it('updates caseFiles with the call result', async () => {
        await wrapper.vm.fetchCaseFilesInformation();
        expect(wrapper.vm.caseFiles).toEqual(mockCombinedHousehold().metadata.caseFiles);
      });
    });
  });
});
