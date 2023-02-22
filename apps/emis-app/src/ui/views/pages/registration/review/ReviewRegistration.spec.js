import Vuetify from 'vuetify';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();

const vuetify = new Vuetify();

describe('ReviewRegistrationLib.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      stubs: {
        'previous-events-template': {
          template: '<div />',
        },
      },
    });
  });

  describe('Computed', () => {
    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $hasFeature: () => true,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $hasFeature: () => false,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });
});
