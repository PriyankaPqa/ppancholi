/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';
import { TenantSettingsService } from '@/services/tenantSettings/entity';
import {
  FeatureKeys,
  ICreateTenantSettingsRequest,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
  TenantSettingsEntity,
} from '@/entities/tenantSettings';
import { ITenantSettingsEntityState } from './tenantSettingsEntity.types';

export class TenantSettingsEntityModule extends BaseModule<ITenantSettingsEntity, uuid> {
  constructor(readonly service: TenantSettingsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: (this.actions as unknown) as ActionTree<IState<ITenantSettingsEntity>, IRootState>,
  });

  public state: ITenantSettingsEntityState = {
    ...this.baseState,

    currentTenantSettings: new TenantSettingsEntity(),
  };

  public getters = {
    ...this.baseGetters,

    currentTenantSettings: (state: ITenantSettingsEntityState) => state.currentTenantSettings,

    isFeatureEnabled: (state: ITenantSettingsEntityState) => (featureKey: FeatureKeys): boolean => state
      .currentTenantSettings?.features?.find((f) => f.key === featureKey)?.enabled || false,
  };

  public mutations = {
    ...this.baseMutations,

    setCurrentTenantSettings: (state: ITenantSettingsEntityState, tenantSettingsData: ITenantSettingsEntityData) => {
      state.currentTenantSettings = new TenantSettingsEntity(tenantSettingsData);
    },
  };

  public actions = {
    ...this.baseActions,

    getCurrentTenantSettings: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
    ): Promise<ITenantSettingsEntityData> => {
      const result = await this.service.getCurrentTenantSettings();

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return result;
    },

    createTenantSettings: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      payload: ICreateTenantSettingsRequest,
    ): Promise<ITenantSettingsEntityData> => {
      const result = await this.service.createTenantSettings(payload);

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return result;
    },

    createTenantDomains: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      payload: ISetDomainsRequest,
    ): Promise<ITenantSettingsEntityData> => {
      const result = await this.service.createTenantDomains(payload);

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return result;
    },

    enableFeature: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      featureId: uuid,
    ): Promise<ITenantSettingsEntityData> => {
      const result = await this.service.enableFeature(featureId);
      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return result;
    },

    disableFeature: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      featureId: uuid,
    ): Promise<ITenantSettingsEntityData> => {
      const result = await this.service.disableFeature(featureId);
      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return result;
    },
  };
}
