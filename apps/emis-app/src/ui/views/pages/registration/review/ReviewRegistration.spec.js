import Vuetify from 'vuetify';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();

const vuetify = new Vuetify();

const { pinia } = useMockRegistrationStore();
const tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
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

      describe('consentStatements', () => {
        it('Should return the right value', async () => {
          tenantSettingsStore.currentTenantSettings.consentStatements = [{ id: 'abc', name: { translation: { en: 'hello' } }, statement: { translation: { en: 'hello' } } },
            { id: 'def', name: { translation: { en: 'second' } }, statement: { translation: { en: 'second' } } }];
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
          });
          expect(wrapper.vm.consentStatements).toEqual(tenantSettingsStore.currentTenantSettings.consentStatements);
        });
      });
    });
  });
});
