import { mockStore } from '@/store';
import { BrandingStorage } from './storage';
import { BRANDING_ENTITIES, BRANDING_METADATA } from '@/constants/vuex-modules';
import { mockEditColoursRequest, mockEditTenantDetailsRequest } from '@/entities/branding';

const entityModuleName = BRANDING_ENTITIES;
const metadataModuleName = BRANDING_METADATA;

const store = mockStore(
  {
    modules: {
      [entityModuleName]: {
        state: {},
      },
      [metadataModuleName]: {
        state: {},
      },
    },
  },
  { commit: true, dispatch: true },
);

const storage = new BrandingStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Branding Storage', () => {
  describe('>> Getters', () => {
    it('should proxy branding', () => {
      const storageGetter = storage.getters.branding();
      const storeGetter = store.getters[`${entityModuleName}/branding`];
      expect(storageGetter).toEqual(storeGetter);
    });

    it('should proxy logoUrl', () => {
      const storageGetter = storage.getters.logoUrl('en');
      const storeGetter = store.getters[`${entityModuleName}/logoUrl`]('en');
      expect(storageGetter).toEqual(storeGetter);
    });
  });

  describe('>> Actions', () => {
    it('should proxy getBranding', () => {
      storage.actions.getBranding();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/getBranding`);
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

    it('should proxy getLogoUrl', () => {
      storage.actions.getLogoUrl('en');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/getLogoUrl`, 'en');
    });
  });
});
