import { IStore, IState } from '@/store';
import { IStorage } from './storage.types';
import { Base } from '../base';
import {
  FeatureKeys,
  ICreateTenantSettingsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@/entities/tenantSettings';

export class TenantSettingsStorage extends Base<ITenantSettingsEntity, never, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    super(pStore, pEntityModuleName, null);
  }

  private getters = {
    ...this.baseGetters,

    currentTenantSettings: () => this.store.getters[`${this.entityModuleName}/currentTenantSettings`],

    isFeatureEnabled: (featureKey: FeatureKeys): boolean => this.store.getters[`${this.entityModuleName}/isFeatureEnabled`](featureKey),
  };

  private actions = {
    ...this.baseActions,

    getCurrentTenantSettings: (): Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/getCurrentTenantSettings`),

    createTenantSettings: (payload: ICreateTenantSettingsRequest):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/createTenantSettings`, payload),

    createTenantDomains: (payload: ISetDomainsRequest):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/createTenantDomains`, payload),

    enableFeature: (featureId: uuid):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/enableFeature`, featureId),

    disableFeature: (featureId: uuid):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/disableFeature`, featureId),
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
