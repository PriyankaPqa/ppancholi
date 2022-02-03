/**
 * @group store
 */

import { ActionContext } from 'vuex';
import { TenantSettingsEntityModule } from './tenantSettingsEntity';
import { mockTenantSettingsService, TenantSettingsService } from '../../../services/tenantSettings/entity';
import { ITenantSettingsEntityState } from './tenantSettingsEntity.types';
import {
  FeatureKeys,
  IBrandingEntityData,
  IFeatureEntity,
  ITenantSettingsEntity,
  mockBrandingEntity,
  mockBrandingEntityData,
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockFeatures,
  mockSetDomainsRequest,
  mockTenantSettingsEntity,
  mockTenantSettingsEntityData,
  TenantSettingsEntity,
} from '../../../entities/tenantSettings';
import vuetify from '../../../plugins/vuetify/vuetify';

const service = mockTenantSettingsService();
let module: TenantSettingsEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ITenantSettingsEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>;

describe('>>> TenantSettings entity module', () => {
  beforeEach(() => {
    module = new TenantSettingsEntityModule(service as unknown as TenantSettingsService, vuetify);
  });

  describe('>> Getters', () => {
    describe('currentTenantSettings', () => {
      it('returns the currentTenantSettings', () => {
        module.state.currentTenantSettings = mockTenantSettingsEntity();

        const res = module.getters.currentTenantSettings(module.state);

        expect(res).toEqual(mockTenantSettingsEntity());
      });
    });

    describe('isFeatureEnabled', () => {
      it('returns true if AddressAutoFill is enabled', () => {
        module.state.currentTenantSettings = {
          features: [{
            key: FeatureKeys.AddressAutoFill,
            enabled: true,
          } as IFeatureEntity],
        } as ITenantSettingsEntity;

        const res = module.getters.isFeatureEnabled(module.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(true);
      });

      it('returns false if AddressAutoFill is disabled', () => {
        module.state.currentTenantSettings = {
          features: [{
            key: FeatureKeys.AddressAutoFill,
            enabled: false,
          } as IFeatureEntity],
        } as ITenantSettingsEntity;

        const res = module.getters.isFeatureEnabled(module.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(false);
      });

      it('returns false if feature not found', () => {
        module.state.currentTenantSettings = null as ITenantSettingsEntity;

        const res = module.getters.isFeatureEnabled(module.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(false);
      });
    });

    describe('branding', () => {
      it('returns the branding', () => {
        module.state.currentTenantSettings.branding = mockBrandingEntity();

        const res = module.getters.branding(module.state);

        expect(res).toEqual(mockBrandingEntity());
      });
    });

    describe('logoUrl', () => {
      it('returns the correct url', () => {
        module.state.logoUrl = {
          en: 'url en',
          fr: 'url fr',
        };

        expect(module.getters.logoUrl(module.state)('en')).toEqual('url en');
        expect(module.getters.logoUrl(module.state)('fr')).toEqual('url fr');
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setCurrentTenantSettings', () => {
      it('sets the current tenant settings', () => {
        const tenantSettingsData = mockTenantSettingsEntityData();

        module.mutations.setCurrentTenantSettings(module.state, tenantSettingsData);

        expect(module.state.currentTenantSettings).toEqual(new TenantSettingsEntity(tenantSettingsData));
      });

      it('updates the theme', () => {
        const tenantSettingsData = mockTenantSettingsEntityData();

        module.updateTheme = jest.fn();

        module.mutations.setCurrentTenantSettings(module.state, tenantSettingsData);

        expect(module.updateTheme).toHaveBeenCalledWith(new TenantSettingsEntity(tenantSettingsData).branding);
      });
    });

    describe('setFeatures', () => {
      it('should set features', () => {
        const features = mockFeatures();
        module.mutations.setFeatures(module.state, features);
        expect(module.state.currentTenantSettings.features).toEqual(features);
      });
    });

    describe('setBranding', () => {
      it('sets the branding', () => {
        const brandingData = mockBrandingEntityData();

        module.mutations.setBranding(module.state, brandingData);

        expect(module.state.currentTenantSettings.branding).toEqual({
          ...brandingData,
          showName: !brandingData.hideName,
        });
      });

      it('updates the theme', () => {
        const brandingData = mockBrandingEntityData();

        module.updateTheme = jest.fn();

        module.mutations.setBranding(module.state, brandingData);

        expect(module.updateTheme).toHaveBeenCalledWith({
          ...brandingData,
          showName: !brandingData.hideName,
        });
      });
    });

    describe('setLogoUrl', () => {
      it('sets the logo url', () => {
        const url = 'mock url';

        module.mutations.setLogoUrl(module.state, {
          languageCode: 'en',
          url,
        });

        expect(module.state.logoUrl.en).toEqual('mock url');
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchCurrentTenantSettings', () => {
      it('calls the getCurrentTenantSettings service', async () => {
        module.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.fetchCurrentTenantSettings(actionContext);

        expect(module.service.getCurrentTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.fetchCurrentTenantSettings(actionContext);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantSettings', () => {
      it('calls the createTenantSettings service', async () => {
        module.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await module.actions.createTenantSettings(actionContext, payload);

        expect(module.service.createTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await module.actions.createTenantSettings(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantDomains', () => {
      it('calls the createTenantDomains service', async () => {
        module.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await module.actions.createTenantDomains(actionContext, payload);

        expect(module.service.createTenantDomains).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        module.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await module.actions.createTenantDomains(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('enableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        module.service.enableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.enableFeature(actionContext, featureId);

        expect(module.service.enableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        module.service.enableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.enableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('disableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        module.service.disableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.disableFeature(actionContext, featureId);

        expect(module.service.disableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        module.service.disableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.disableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('fetchUserTenants', () => {
      it('calls the getUserTenants service', async () => {
        module.service.getUserTenants = jest.fn();

        await module.actions.fetchUserTenants();

        expect(module.service.getUserTenants).toHaveBeenCalledTimes(1);
      });

      it('maps the brandings', async () => {
        const mockData = [mockBrandingEntityData()];

        module.service.getUserTenants = jest.fn(() => Promise.resolve(mockData));

        const results = await module.actions.fetchUserTenants();

        expect(results).toEqual(mockData.map((data: IBrandingEntityData) => ({
          ...data,
          showName: !data.hideName,
        })));
      });
    });

    describe('updateColours', () => {
      it('calls the updateColours service', async () => {
        const payload = mockEditColoursRequest();

        module.service.updateColours = jest.fn();

        await module.actions.updateColours(actionContext, payload);

        expect(module.service.updateColours).toHaveBeenCalledWith(payload);
      });

      it('commits the tenantSettings', async () => {
        const payload = mockEditColoursRequest();

        module.service.updateColours = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.updateColours(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('updateTenantDetails', () => {
      it('calls the updateTenantDetails service', async () => {
        const payload = mockEditTenantDetailsRequest();

        module.service.updateTenantDetails = jest.fn();

        await module.actions.updateTenantDetails(actionContext, payload);

        expect(module.service.updateTenantDetails).toHaveBeenCalledWith(payload);
      });

      it('commits the tenantSettings', async () => {
        const payload = mockEditTenantDetailsRequest();

        module.service.updateTenantDetails = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await module.actions.updateTenantDetails(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('fetchPublicFeatures', () => {
      it('calls the getPublicFeatures service', async () => {
        module.service.getPublicFeatures = jest.fn(() => Promise.resolve(mockFeatures()));

        await module.actions.fetchPublicFeatures(actionContext);

        expect(module.service.getPublicFeatures).toHaveBeenCalledTimes(1);
      });

      it('commits the features', async () => {
        module.service.getPublicFeatures = jest.fn(() => Promise.resolve(mockFeatures()));

        await module.actions.fetchPublicFeatures(actionContext);

        expect(actionContext.commit).toBeCalledWith('setFeatures', mockFeatures());
      });
    });

    describe('fetchBranding', () => {
      it('calls the getBranding service', async () => {
        module.service.getBranding = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.fetchBranding(actionContext);

        expect(module.service.getBranding).toHaveBeenCalledTimes(1);
      });

      it('commits the branding', async () => {
        module.service.getBranding = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.fetchBranding(actionContext);

        expect(actionContext.commit).toBeCalledWith('setBranding', mockBrandingEntityData());
      });
    });

    describe('fetchLogoUrl', () => {
      it('calls the getLogoUrl service', async () => {
        module.service.getLogoUrl = jest.fn();

        await module.actions.fetchLogoUrl(actionContext, 'en');

        expect(module.service.getLogoUrl).toHaveBeenCalledWith('en');
      });

      it('commits the logoUrl', async () => {
        module.service.getLogoUrl = jest.fn(() => Promise.resolve('mock url'));

        await module.actions.fetchLogoUrl(actionContext, 'en');

        expect(actionContext.commit).toBeCalledWith('setLogoUrl', {
          languageCode: 'en',
          url: 'mock url',
        });
      });
    });
  });
});
