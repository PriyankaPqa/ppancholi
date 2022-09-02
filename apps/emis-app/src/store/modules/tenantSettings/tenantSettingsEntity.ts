/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import {
  FeatureKeys,
  IBrandingEntity,
  IBrandingEntityData,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
  TenantSettingsEntity,
} from '@libs/entities-lib/tenantSettings';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
import { IMultilingual } from '@libs/shared-lib/types';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';
import { ITenantSettingsEntityState } from './tenantSettingsEntity.types';

export class TenantSettingsEntityModule extends BaseModule<ITenantSettingsEntity, uuid> {
  constructor(readonly service: TenantSettingsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
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

      this.updateTheme(state.currentTenantSettings.branding);
    },
  };

  public actions = {
    ...this.baseActions,

    fetchCurrentTenantSettings: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
    ): Promise<ITenantSettingsEntityData> => {
      try {
        const result = await this.service.getCurrentTenantSettings();
        if (result) {
          // force a new date because BE doesnt always update it
          result.timestamp = new Date();
          context.commit('setCurrentTenantSettings', result);
        }
        return result;
      } catch {
        return null;
      }
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

    fetchUserTenants: async (): Promise<IBrandingEntity[]> => {
      const results = await this.service.getUserTenants();

      if (results) {
        return results.map((branding: IBrandingEntityData) => ({
          ...branding,
          showName: !branding.hideName,
        }));
      }
      return [];
    },

    updateColours: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      payload: IEditColoursRequest,
    ): Promise<ITenantSettingsEntity> => {
      const result = await this.service.updateColours(payload);

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return new TenantSettingsEntity(result);
    },

    updateTenantDetails: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      payload: IEditTenantDetailsRequest,
    ): Promise<ITenantSettingsEntity> => {
      const result = await this.service.updateTenantDetails(payload);

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return new TenantSettingsEntity(result);
    },

    updateSupportEmails: async (
      context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>,
      payload: IMultilingual,
    ): Promise<ITenantSettingsEntity> => {
      const result = await this.service.updateSupportEmails(payload);

      if (result) {
        context.commit('setCurrentTenantSettings', result);
      }

      return new TenantSettingsEntity(result);
    },
  };

  public updateTheme(branding: IBrandingEntity) {
    const { colours } = branding;

    const lightTheme = vuetify.framework.theme.themes.light;

    const { primary }: any = lightTheme;
    primary.base = colours.primary;
    primary.lighten2 = colours.primaryLight;
    primary.darken1 = colours.primaryDark;

    const { secondary }: any = lightTheme;
    secondary.base = colours.secondary;
  }
}
