/**
 * @group storage
 */

import { TENANT_SETTINGS_ENTITIES } from '@/constants/vuex-modules';
import { mockCreateTenantSettingsRequest, mockSetDomainsRequest } from '@/entities/tenantSettings';
import { mockStore } from '@/store';
import { TenantSettingsStorage } from './storage';

const entityModuleName = TENANT_SETTINGS_ENTITIES;

const store = mockStore(
  {
    modules: {
      [entityModuleName]: {
        state: {},
      },
    },
  },
  { commit: true, dispatch: true },
);

const storage = new TenantSettingsStorage(store, entityModuleName).make();

describe('>>> TenantSettings Storage', () => {
  describe('>> Getters', () => {
    it('should proxy currentTenantSettings', () => {
      const storageGetter = storage.getters.currentTenantSettings();
      const storeGetter = store.getters[`${entityModuleName}/currentTenantSettings`];
      expect(storageGetter).toEqual(storeGetter);
    });
  });

  describe('>> Actions', () => {
    it('should proxy getCurrentTenantSettings', () => {
      storage.actions.getCurrentTenantSettings();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/getCurrentTenantSettings`);
    });

    it('should proxy createTenantSettings', () => {
      const payload = mockCreateTenantSettingsRequest();
      storage.actions.createTenantSettings(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createTenantSettings`, payload);
    });

    it('should proxy createTenantDomains', () => {
      const payload = mockSetDomainsRequest();
      storage.actions.createTenantDomains(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createTenantDomains`, payload);
    });
  });
});
