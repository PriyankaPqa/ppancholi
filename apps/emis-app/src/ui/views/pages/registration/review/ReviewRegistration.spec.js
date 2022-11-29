import Vuetify from 'vuetify';
import { mockCombinedHousehold } from '@libs/entities-lib/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/storage';
import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

describe('ReviewRegistrationLib.vue', () => {
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

  describe('Computed', () => {
    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });
});
