import { IStore, IState } from '@libs/registration-lib/store/store.types';

import {
  FeatureKeys,
  IBrandingEntity,
  ICreateTenantSettingsRequest, IEditColoursRequest, IEditTenantDetailsRequest, IFeatureEntity, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
  IValidateCaptchaAllowedIpAddressResponse,
} from '@libs/entities-lib/tenantSettings';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class TenantSettingsStorage extends Base<ITenantSettingsEntity, never, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    super(pStore, pEntityModuleName, null);
  }

  private getters = {
    ...this.baseGetters,

    currentTenantSettings: () => this.store.getters[`${this.entityModuleName}/currentTenantSettings`],

    branding: () => this.store.getters[`${this.entityModuleName}/branding`],

    isFeatureEnabled: (featureKey: FeatureKeys): boolean => this.store.getters[`${this.entityModuleName}/isFeatureEnabled`](featureKey),

    logoUrl: (languageCode: string) => this.store.getters[`${this.entityModuleName}/logoUrl`](languageCode),

    validateCaptchaAllowedIpAddress: () => this.store.getters[`${this.entityModuleName}/validateCaptchaAllowedIpAddress`],
  };

  private actions = {
    ...this.baseActions,

    fetchCurrentTenantSettings: (): Promise<ITenantSettingsEntityData> => this.store.dispatch(`${this.entityModuleName}/fetchCurrentTenantSettings`),

    fetchPublicFeatures: (): Promise<IFeatureEntity[]> => this.store.dispatch(`${this.entityModuleName}/fetchPublicFeatures`),

    fetchBranding: (): Promise<IBrandingEntity> => this.store.dispatch(`${this.entityModuleName}/fetchBranding`),

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

    fetchLogoUrl: (languageCode: string): Promise<string> => this.store.dispatch(`${this.entityModuleName}/fetchLogoUrl`, languageCode),

    validateCaptchaAllowedIpAddress: ():
      Promise<IValidateCaptchaAllowedIpAddressResponse> => this.store.dispatch(`${this.entityModuleName}/validateCaptchaAllowedIpAddress`),
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
