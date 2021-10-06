import { IStore, IState } from '@/store';
import { IStorage } from './storage.types';
import { Base } from '../base';
import {
  IBrandingEntity, IEditColoursRequest, IEditTenantDetailsRequest,
} from '@/entities/branding';

export class BrandingStorage extends Base<IBrandingEntity, never, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    branding: () => this.store.getters[`${this.entityModuleName}/branding`],

    logoUrl: (languageCode: string) => this.store.getters[`${this.entityModuleName}/logoUrl`](languageCode),
  };

  private actions = {
    ...this.baseActions,

    getBranding: (): Promise<IBrandingEntity> => this.store.dispatch(`${this.entityModuleName}/getBranding`),

    updateColours: (payload: IEditColoursRequest): Promise<IBrandingEntity> => this.store.dispatch(`${this.entityModuleName}/updateColours`, payload),

    updateTenantDetails: (payload: IEditTenantDetailsRequest):
      Promise<IBrandingEntity> => this.store.dispatch(`${this.entityModuleName}/updateTenantDetails`, payload),

    getLogoUrl: (languageCode: string): Promise<string> => this.store.dispatch(`${this.entityModuleName}/getLogoUrl`, languageCode),
  };

  private mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
