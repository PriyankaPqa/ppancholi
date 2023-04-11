import {
  createLocalVue, shallowMount,
} from '@/test/testSetup';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from './PrivacyStatement.vue';

const localVue = createLocalVue();

const { pinia } = useMockRegistrationStore();
const tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
describe('PrivacyStatement', () => {
  let wrapper;

  describe('Computed', () => {
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
