import {
  FeatureKeys,
  IBrandingEntity,
  ICreateTenantSettingsRequest, IEditColoursRequest, IEditTenantDetailsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@libs/entities-lib/tenantSettings';
import { IMultilingual } from '@libs/shared-lib/types';
import { IStore, IState } from '../../store/store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

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

    fetchCurrentTenantSettings: (): Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/fetchCurrentTenantSettings`),

    createTenantSettings: (payload: ICreateTenantSettingsRequest):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/createTenantSettings`, payload),

    createTenantDomains: (payload: ISetDomainsRequest):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/createTenantDomains`, payload),

    enableFeature: (featureId: uuid):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/enableFeature`, featureId),

    disableFeature: (featureId: uuid):
      Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/disableFeature`, featureId),

    fetchUserTenants: (): Promise<IBrandingEntity[]> => this.store.dispatch(`${this.entityModuleName}/fetchUserTenants`),

    updateColours: (payload: IEditColoursRequest):
      Promise<ITenantSettingsEntity> => this.store.dispatch(`${this.entityModuleName}/updateColours`, payload),

    updateTenantDetails: (payload: IEditTenantDetailsRequest):
      Promise<ITenantSettingsEntity> => this.store.dispatch(`${this.entityModuleName}/updateTenantDetails`, payload),

    updateSupportEmails: (payload: IMultilingual):
      Promise<ITenantSettingsEntity> => this.store.dispatch(`${this.entityModuleName}/updateSupportEmails`, payload),
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
