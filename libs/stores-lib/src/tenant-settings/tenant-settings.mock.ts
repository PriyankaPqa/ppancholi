import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { mockTenantSettingsEntities } from '@libs/entities-lib/tenantSettings';
import { getMockEntityStoreComponents } from '../base';
import { getMockTenantSettingsExtensionComponents } from './tenant-settings-extension.mock';

const storeId = 'tenant-settings';

export const useMockTenantSettingsStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockTenantSettingsEntities()),
    ...getMockTenantSettingsExtensionComponents(),
  }));

  return {
    pinia: p,
    tenantSettingsStore: useStore(),
  };
};
