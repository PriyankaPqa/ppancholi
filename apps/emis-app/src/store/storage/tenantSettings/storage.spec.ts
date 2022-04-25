import { TENANT_SETTINGS_ENTITIES } from '@/constants/vuex-modules';
import {
  FeatureKeys,
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockSetDomainsRequest,
} from '@/entities/tenantSettings';
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

    it('should proxy isFeatureEnabled', () => {
      const featureKey = FeatureKeys.AddressAutoFill;
      const storageGetter = storage.getters.isFeatureEnabled(featureKey);
      const storeGetter = store.getters[`${entityModuleName}/isFeatureEnabled`](featureKey);
      expect(storageGetter).toEqual(storeGetter);
    });

    it('should proxy logoUrl', () => {
      const storageGetter = storage.getters.logoUrl('en');
      const storeGetter = store.getters[`${entityModuleName}/logoUrl`]('en');
      expect(storageGetter).toEqual(storeGetter);
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchCurrentTenantSettings', () => {
      storage.actions.fetchCurrentTenantSettings();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCurrentTenantSettings`);
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

    it('should proxy enableFeature', async () => {
      const featureId = 'id';

      await storage.actions.enableFeature(featureId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/enableFeature`, featureId);
    });

    it('should proxy disableFeature', async () => {
      const featureId = 'id';

      await storage.actions.disableFeature(featureId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/disableFeature`, featureId);
    });

    it('should proxy fetchUserTenants', () => {
      storage.actions.fetchUserTenants();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchUserTenants`);
    });

    it('should proxy updateColours', () => {
      const payload = mockEditColoursRequest();
      storage.actions.updateColours(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateColours`, payload);
    });

    it('should proxy updateTenantDetails', () => {
      const payload = mockEditTenantDetailsRequest();
      storage.actions.updateTenantDetails(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateTenantDetails`, payload);
    });

    it('should proxy updateSupportEmails', () => {
      const payload = {
        translation: {
          en: 'support_en@redcross.ca',
          fr: 'support_fr@redcross.ca',
        },
      };
      storage.actions.updateSupportEmails(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateSupportEmails`, payload);
    });

    it('should proxy fetchLogoUrl', () => {
      storage.actions.fetchLogoUrl('en');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchLogoUrl`, 'en');
    });
  });
});
