import {
  FeatureKeys,
  IFeatureEntity,
  ITenantSettingsEntity,
  mockBrandingEntity,
  mockBrandingEntityData,
  mockTenantSettingsEntityData,
  TenantSettingsEntity,
  IdParams, mockCreateTenantSettingsRequest, mockSetDomainsRequest, IBrandingEntityData, mockEditColoursRequest, mockEditTenantDetailsRequest, mockFeatures,
} from '@libs/entities-lib/tenantSettings';
import { mockTenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { getBaseStoreComponents } from '@/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './tenant-settings-extension';

const entityService = mockTenantSettingsService();
const baseComponents = getBaseStoreComponents<ITenantSettingsEntity, IdParams>(entityService);

const useTestStore = (opts = {}) => {
  const pinia = createTestingPinia({ stubActions: false });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useProgramStore = defineStore('test-program', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useProgramStore(pinia);
};
const createTestStore = (bComponents = {}) => useTestStore(bComponents);

describe('>>> Tenant Settings module', () => {
  describe('isFeatureEnabled', () => {
    it('returns true if AddressAutoFill is enabled', () => {
      const store = createTestStore();

      store.currentTenantSettings = {
        features: [{
          key: FeatureKeys.AddressAutoFill,
          enabled: true,
        } as unknown as IFeatureEntity],
      } as unknown as ITenantSettingsEntity;

      const res = store.isFeatureEnabled(FeatureKeys.AddressAutoFill);

      expect(res)
        .toBe(true);
    });

    it('returns false if AddressAutoFill is disabled', () => {
      const store = createTestStore();
      store.currentTenantSettings = {
        features: [{
          key: FeatureKeys.AddressAutoFill,
          enabled: false,
        } as IFeatureEntity],
      } as ITenantSettingsEntity;

      const res = store.isFeatureEnabled(FeatureKeys.AddressAutoFill);

      expect(res)
        .toBe(false);
    });

    it('returns false if feature not found', () => {
      const store = createTestStore();
      store.currentTenantSettings = null as ITenantSettingsEntity;

      const res = store.isFeatureEnabled(FeatureKeys.AddressAutoFill);

      expect(res)
        .toBe(false);
    });
  });

  describe('getBranding', () => {
    it('returns the branding', () => {
      const store = createTestStore();
      store.currentTenantSettings.branding = mockBrandingEntity();
      const res = store.getBranding();
      expect(res)
        .toEqual(mockBrandingEntity());
    });
  });

  describe('setCurrentTenantSettings', () => {
    it('sets the current tenant settings', () => {
      const tenantSettingsData = mockTenantSettingsEntityData();
      const store = createTestStore();
      store.setCurrentTenantSettings(tenantSettingsData);
      expect(store.currentTenantSettings)
        .toEqual(new TenantSettingsEntity(tenantSettingsData));
    });
  });

  describe('setBranding', () => {
    it('sets the branding', () => {
      const brandingData = mockBrandingEntityData();
      const store = createTestStore();
      store.setBranding(brandingData);

      expect(store.currentTenantSettings.branding)
        .toEqual({
          ...brandingData,
          showName: !brandingData.hideName,
        });
    });
  });

  describe('fetchCurrentTenantSettings', () => {
    it('calls the getCurrentTenantSettings service', async () => {
      const store = createTestStore();

      await store.fetchCurrentTenantSettings();

      expect(entityService.getCurrentTenantSettings)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the tenant settings', async () => {
      const store = createTestStore();
      const date = new Date(1990, 3, 1);
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      expected.timestamp = date;
      jest.useFakeTimers();
      jest.setSystemTime(date);
      await store.fetchCurrentTenantSettings();

      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });

  describe('createTenantSettings', () => {
    it('calls the createTenantSettings service', async () => {
      const store = createTestStore();
      const payload = mockCreateTenantSettingsRequest();

      await store.createTenantSettings(payload);

      expect(entityService.createTenantSettings)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the tenant settings', async () => {
      const store = createTestStore();
      const payload = mockCreateTenantSettingsRequest();
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      await store.createTenantSettings(payload);

      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });

  describe('createTenantDomains', () => {
    it('calls the createTenantDomains service', async () => {
      const payload = mockSetDomainsRequest();
      const store = createTestStore();
      await store.createTenantDomains(payload);

      expect(entityService.createTenantDomains)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the tenant settings', async () => {
      const store = createTestStore();
      const payload = mockSetDomainsRequest();
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      await store.createTenantDomains(payload);

      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });

  describe('enableFeature', () => {
    it('calls the service', async () => {
      const featureId = 'id';
      const store = createTestStore();
      await store.enableFeature(featureId);

      expect(entityService.enableFeature)
        .toHaveBeenCalledWith(featureId);
    });

    it('updates the entity', async () => {
      const featureId = 'id';
      const store = createTestStore();
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      await store.enableFeature(featureId);
      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });

  describe('disableFeature', () => {
    it('calls the service', async () => {
      const featureId = 'id';
      const store = createTestStore();
      await store.disableFeature(featureId);
      expect(entityService.disableFeature)
        .toHaveBeenCalledWith(featureId);
    });

    it('updates the entity', async () => {
      const featureId = 'id';
      const store = createTestStore();
      await store.disableFeature(featureId);
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });

  describe('fetchUserTenants', () => {
    it('calls the getUserTenants service', async () => {
      const store = createTestStore();
      await store.fetchUserTenants();
      expect(entityService.getUserTenants)
        .toHaveBeenCalledTimes(1);
    });

    it('maps the brandings', async () => {
      const mockData = [mockBrandingEntityData()];
      const store = createTestStore();
      const results = await store.fetchUserTenants();

      expect(results)
        .toEqual(mockData.map((data: IBrandingEntityData) => ({
          ...data,
          showName: !data.hideName,
        })));
    });
  });

  describe('updateColours', () => {
    it('commits the tenantSettings', async () => {
      const payload = mockEditColoursRequest();
      const store = createTestStore();
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      await store.updateColours(payload);
      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
    it('calls the updateColours service', async () => {
      const payload = mockEditColoursRequest();
      const store = createTestStore();
      entityService.updateColours = jest.fn();

      await store.updateColours(payload);

      expect(entityService.updateColours)
        .toHaveBeenCalledWith(payload);
    });
  });

  describe('updateTenantDetails', () => {
    it('commits the tenantSettings', async () => {
      const payload = mockEditTenantDetailsRequest();
      const store = createTestStore();
      await store.updateTenantDetails(payload);
      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
    it('calls the updateTenantDetails service', async () => {
      const payload = mockEditTenantDetailsRequest();
      entityService.updateTenantDetails = jest.fn();
      const store = createTestStore();
      await store.updateTenantDetails(payload);

      expect(entityService.updateTenantDetails)
        .toHaveBeenCalledWith(payload);
    });
  });

  describe('fetchPublicFeatures', () => {
    it('calls the getPublicFeatures service', async () => {
      const store = createTestStore();
      await store.fetchPublicFeatures();
      expect(entityService.getPublicFeatures)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the features', async () => {
      const store = createTestStore();
      await store.fetchPublicFeatures();

      expect(store.currentTenantSettings.features)
        .toEqual(mockFeatures());
    });
  });

  describe('fetchBranding', () => {
    it('calls the getBranding service', async () => {
      const store = createTestStore();
      await store.fetchBranding();
      expect(entityService.getBranding)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the branding', async () => {
      const store = createTestStore();
      await store.fetchBranding();

      expect(store.getBranding())
        .toEqual({
          ...mockBrandingEntityData(),
          showName: true,
        });
    });
  });

  describe('validateCaptchaAllowedIpAddress', () => {
    it('calls the validateCaptchaAllowedIpAddress service', async () => {
      entityService.validateCaptchaAllowedIpAddress = jest.fn();
      const store = createTestStore();
      await store.validateCaptchaAllowedIpAddress();

      expect(entityService.validateCaptchaAllowedIpAddress)
        .toHaveBeenCalledTimes(1);
    });

    it('commits the validateCaptchaAllowedIpAddress', async () => {
      entityService.validateCaptchaAllowedIpAddress = jest.fn(() => ({
        ipAddressIsAllowed: true,
        clientIpAddress: '192.168.0.1',
      }));
      const store = createTestStore();

      await store.validateCaptchaAllowedIpAddress();

      expect(store.recaptcha)
        .toEqual({
          ipAddressIsAllowed: true,
          clientIpAddress: '192.168.0.1',
        });
    });
  });

  describe('updateSupportEmails', () => {
    it('calls the updateSupportEmails service', async () => {
      const payload = {
        translation: {
          en: 'support_en@redcross.ca',
          fr: 'support_fr@redcross.ca',
        },
      };

      const store = createTestStore();
      await store.updateSupportEmails(payload);

      expect(entityService.updateSupportEmails)
        .toHaveBeenCalledWith(payload);
    });

    it('commits the tenantSettings', async () => {
      const payload = {
        translation: {
          en: 'support_en@redcross.ca',
          fr: 'support_fr@redcross.ca',
        },
      };

      const store = createTestStore();
      await store.updateSupportEmails(payload);

      const expected = new TenantSettingsEntity(mockTenantSettingsEntityData());
      expect(store.currentTenantSettings)
        .toEqual(expected);
    });
  });
});
