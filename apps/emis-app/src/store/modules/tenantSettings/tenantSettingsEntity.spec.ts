import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { TenantSettingsService } from '@/services/tenantSettings/entity';
import {
  FeatureKeys,
  IBrandingEntityData,
  IFeatureEntity,
  ITenantSettingsEntity,
  mockBrandingEntityData,
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockSetDomainsRequest,
  mockTenantSettingsEntity,
  mockTenantSettingsEntityData,
  TenantSettingsEntity,
} from '@/entities/tenantSettings';
import { TenantSettingsEntityModule } from './tenantSettingsEntity';
import { ITenantSettingsEntityState } from './tenantSettingsEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const service = new TenantSettingsService(httpClient);
let myModule: TenantSettingsEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ITenantSettingsEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>;

const signalR = mockSignalR();

describe('>>> TenantSettings entity module', () => {
  beforeEach(() => {
    myModule = new TenantSettingsEntityModule(service, signalR);
  });

  describe('>> Getters', () => {
    describe('currentTenantSettings', () => {
      it('returns the currentTenantSettings', () => {
        myModule.state.currentTenantSettings = mockTenantSettingsEntity();

        const res = myModule.getters.currentTenantSettings(myModule.state);

        expect(res).toEqual(mockTenantSettingsEntity());
      });
    });

    describe('isFeatureEnabled', () => {
      it('returns true if AddressAutoFill is enabled', () => {
        myModule.state.currentTenantSettings = {
          features: [{
            key: FeatureKeys.AddressAutoFill,
            enabled: true,
          } as IFeatureEntity],
        } as ITenantSettingsEntity;

        const res = myModule.getters.isFeatureEnabled(myModule.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(true);
      });

      it('returns false if AddressAutoFill is disabled', () => {
        myModule.state.currentTenantSettings = {
          features: [{
            key: FeatureKeys.AddressAutoFill,
            enabled: false,
          } as IFeatureEntity],
        } as ITenantSettingsEntity;

        const res = myModule.getters.isFeatureEnabled(myModule.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(false);
      });

      it('returns false if feature not found', () => {
        myModule.state.currentTenantSettings = null as ITenantSettingsEntity;

        const res = myModule.getters.isFeatureEnabled(myModule.state)(FeatureKeys.AddressAutoFill);

        expect(res).toBe(false);
      });
    });

    describe('logoUrl', () => {
      it('returns the correct url', () => {
        myModule.state.logoUrl = {
          en: 'url en',
          fr: 'url fr',
        };

        expect(myModule.getters.logoUrl(myModule.state)('en')).toEqual('url en');
        expect(myModule.getters.logoUrl(myModule.state)('fr')).toEqual('url fr');
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setCurrentTenantSettings', () => {
      it('sets the current tenant settings', () => {
        const tenantSettingsData = mockTenantSettingsEntityData();

        myModule.mutations.setCurrentTenantSettings(myModule.state, tenantSettingsData);

        expect(myModule.state.currentTenantSettings).toEqual(new TenantSettingsEntity(tenantSettingsData));
      });

      it('updates the theme', () => {
        const tenantSettingsData = mockTenantSettingsEntityData();

        myModule.updateTheme = jest.fn();

        myModule.mutations.setCurrentTenantSettings(myModule.state, tenantSettingsData);

        expect(myModule.updateTheme).toHaveBeenCalledWith(new TenantSettingsEntity(tenantSettingsData).branding);
      });
    });

    describe('setLogoUrl', () => {
      it('sets the logo url', () => {
        const url = 'mock url';

        myModule.mutations.setLogoUrl(myModule.state, {
          languageCode: 'en',
          url,
        });

        expect(myModule.state.logoUrl.en).toEqual('mock url');
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchCurrentTenantSettings', () => {
      it('calls the getCurrentTenantSettings service', async () => {
        myModule.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.fetchCurrentTenantSettings(actionContext);

        expect(myModule.service.getCurrentTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        myModule.service.getCurrentTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.fetchCurrentTenantSettings(actionContext);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantSettings', () => {
      it('calls the createTenantSettings service', async () => {
        myModule.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await myModule.actions.createTenantSettings(actionContext, payload);

        expect(myModule.service.createTenantSettings).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        myModule.service.createTenantSettings = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockCreateTenantSettingsRequest();

        await myModule.actions.createTenantSettings(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('createTenantDomains', () => {
      it('calls the createTenantDomains service', async () => {
        myModule.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await myModule.actions.createTenantDomains(actionContext, payload);

        expect(myModule.service.createTenantDomains).toHaveBeenCalledTimes(1);
      });

      it('commits the tenant settings', async () => {
        myModule.service.createTenantDomains = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));
        const payload = mockSetDomainsRequest();

        await myModule.actions.createTenantDomains(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('enableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        myModule.service.enableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.enableFeature(actionContext, featureId);

        expect(myModule.service.enableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        myModule.service.enableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.enableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('disableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        myModule.service.disableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.disableFeature(actionContext, featureId);

        expect(myModule.service.disableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        myModule.service.disableFeature = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.disableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('fetchUserTenants', () => {
      it('calls the getUserTenants service', async () => {
        myModule.service.getUserTenants = jest.fn();

        await myModule.actions.fetchUserTenants();

        expect(myModule.service.getUserTenants).toHaveBeenCalledTimes(1);
      });

      it('maps the brandings', async () => {
        const mockData = [mockBrandingEntityData()];

        myModule.service.getUserTenants = jest.fn(() => Promise.resolve(mockData));

        const results = await myModule.actions.fetchUserTenants();

        expect(results).toEqual(mockData.map((data: IBrandingEntityData) => ({
          ...data,
          showName: !data.hideName,
        })));
      });
    });

    describe('updateColours', () => {
      it('calls the updateColours service', async () => {
        const payload = mockEditColoursRequest();

        myModule.service.updateColours = jest.fn();

        await myModule.actions.updateColours(actionContext, payload);

        expect(myModule.service.updateColours).toHaveBeenCalledWith(payload);
      });

      it('commits the tenantSettings', async () => {
        const payload = mockEditColoursRequest();

        myModule.service.updateColours = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.updateColours(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('updateTenantDetails', () => {
      it('calls the updateTenantDetails service', async () => {
        const payload = mockEditTenantDetailsRequest();

        myModule.service.updateTenantDetails = jest.fn();

        await myModule.actions.updateTenantDetails(actionContext, payload);

        expect(myModule.service.updateTenantDetails).toHaveBeenCalledWith(payload);
      });

      it('commits the tenantSettings', async () => {
        const payload = mockEditTenantDetailsRequest();

        myModule.service.updateTenantDetails = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.updateTenantDetails(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
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

        myModule.service.updateSupportEmails = jest.fn();

        await myModule.actions.updateSupportEmails(actionContext, payload);

        expect(myModule.service.updateSupportEmails).toHaveBeenCalledWith(payload);
      });

      it('commits the tenantSettings', async () => {
        const payload = {
          translation: {
            en: 'support_en@redcross.ca',
            fr: 'support_fr@redcross.ca',
          },
        };

        myModule.service.updateSupportEmails = jest.fn(() => Promise.resolve(mockTenantSettingsEntityData()));

        await myModule.actions.updateSupportEmails(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setCurrentTenantSettings', mockTenantSettingsEntityData());
      });
    });

    describe('fetchLogoUrl', () => {
      it('calls the getLogoUrl service', async () => {
        myModule.service.getLogoUrl = jest.fn();

        await myModule.actions.fetchLogoUrl(actionContext, 'en');

        expect(myModule.service.getLogoUrl).toHaveBeenCalledWith('en');
      });

      it('commits the logoUrl', async () => {
        myModule.service.getLogoUrl = jest.fn(() => Promise.resolve('mock url'));

        await myModule.actions.fetchLogoUrl(actionContext, 'en');

        expect(actionContext.commit).toBeCalledWith('setLogoUrl', {
          languageCode: 'en',
          url: 'mock url',
        });
      });
    });
  });
});
