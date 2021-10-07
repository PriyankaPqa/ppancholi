import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { BrandingEntityModule } from './brandingEntity';
import { IBrandingEntityState } from './brandingEntity.types';
import { BrandingsService } from '@/services/brandings/entity';
import {
  BrandingEntity,
  mockBrandingEntity, mockBrandingEntityData, mockEditColoursRequest, mockEditTenantDetailsRequest,
} from '@/entities/branding';

const service = new BrandingsService(httpClient);
let module: BrandingEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IBrandingEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IBrandingEntityState, IBrandingEntityState>;

describe('>>> Branding entity module', () => {
  beforeEach(() => {
    module = new BrandingEntityModule(service);
  });

  describe('>> Getters', () => {
    describe('branding', () => {
      it('returns the branding', () => {
        module.state.branding = mockBrandingEntity();

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
    describe('setBranding', () => {
      it('sets the branding', () => {
        const branding = mockBrandingEntityData();

        module.mutations.setBranding(module.state, branding);

        expect(module.state.branding).toEqual(new BrandingEntity(branding));
      });

      it('updates the theme', () => {
        const branding = mockBrandingEntityData();

        module.updateTheme = jest.fn();

        module.mutations.setBranding(module.state, branding);

        expect(module.updateTheme).toHaveBeenCalledWith(new BrandingEntity(branding));
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
    describe('getBranding', () => {
      it('calls the getCurrentBranding service', async () => {
        module.service.getCurrentBranding = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.getBranding(actionContext);

        expect(module.service.getCurrentBranding).toHaveBeenCalledTimes(1);
      });

      it('commits the branding', async () => {
        module.service.getCurrentBranding = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.getBranding(actionContext);

        expect(actionContext.commit).toBeCalledWith('setBranding', mockBrandingEntityData());
      });
    });

    describe('updateColours', () => {
      it('calls the updateColours service', async () => {
        const payload = mockEditColoursRequest();

        module.service.updateColours = jest.fn();

        await module.actions.updateColours(actionContext, payload);

        expect(module.service.updateColours).toHaveBeenCalledWith(payload);
      });

      it('commits the branding', async () => {
        const payload = mockEditColoursRequest();

        module.service.updateColours = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.updateColours(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setBranding', mockBrandingEntityData());
      });
    });

    describe('updateTenantDetails', () => {
      it('calls the updateTenantDetails service', async () => {
        const payload = mockEditTenantDetailsRequest();

        module.service.updateTenantDetails = jest.fn();

        await module.actions.updateTenantDetails(actionContext, payload);

        expect(module.service.updateTenantDetails).toHaveBeenCalledWith(payload);
      });

      it('commits the branding', async () => {
        const payload = mockEditTenantDetailsRequest();

        module.service.updateTenantDetails = jest.fn(() => Promise.resolve(mockBrandingEntityData()));

        await module.actions.updateTenantDetails(actionContext, payload);

        expect(actionContext.commit).toBeCalledWith('setBranding', mockBrandingEntityData());
      });
    });

    describe('getLogoUrl', () => {
      it('calls the getLogoUrl service', async () => {
        module.service.getLogoUrl = jest.fn();

        await module.actions.getLogoUrl(actionContext, 'en');

        expect(module.service.getLogoUrl).toHaveBeenCalledWith('en');
      });

      it('commits the logoUrl', async () => {
        module.service.getLogoUrl = jest.fn(() => Promise.resolve('mock url'));

        await module.actions.getLogoUrl(actionContext, 'en');

        expect(actionContext.commit).toBeCalledWith('setLogoUrl', {
          languageCode: 'en',
          url: 'mock url',
        });
      });
    });
  });
});
