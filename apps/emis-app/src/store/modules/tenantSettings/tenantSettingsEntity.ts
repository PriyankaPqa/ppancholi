/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { TenantSettingsService } from '@/services/tenantSettings/entity';
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
} from '@/entities/tenantSettings';
import vuetify from '@/ui/plugins/vuetify/vuetify';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';
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

    logoUrl: {
      en: '/img/placeholder-logo-en.png',
      fr: '/img/placeholder-logo-fr.png',
    },
  };

  public getters = {
    ...this.baseGetters,

    currentTenantSettings: (state: ITenantSettingsEntityState) => state.currentTenantSettings,

    isFeatureEnabled: (state: ITenantSettingsEntityState) => (featureKey: FeatureKeys): boolean => state
      .currentTenantSettings?.features?.find((f) => f.key === featureKey)?.enabled || false,

    logoUrl: (state: ITenantSettingsEntityState) => (languageCode: 'en' | 'fr'): string => {
      if (languageCode !== 'en' && languageCode !== 'fr') {
        return state.logoUrl.en;
      }
      return state.logoUrl[languageCode];
    },
  };

  public mutations = {
    ...this.baseMutations,

    setCurrentTenantSettings: (state: ITenantSettingsEntityState, tenantSettingsData: ITenantSettingsEntityData) => {
      state.currentTenantSettings = new TenantSettingsEntity(tenantSettingsData);

      this.updateTheme(state.currentTenantSettings.branding);
    },

    setLogoUrl: (state: ITenantSettingsEntityState, { languageCode, url }: { languageCode: 'en' | 'fr'; url: string }) => {
      state.logoUrl[languageCode] = url;
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

    fetchLogoUrl: async (context: ActionContext<ITenantSettingsEntityState, ITenantSettingsEntityState>, languageCode: string): Promise<string> => {
      let lang = languageCode;

      if (lang !== 'en' && lang !== 'fr') {
        lang = 'en';
      }

      const url = await this.service.getLogoUrl(lang);

      if (url) {
        context.commit('setLogoUrl', { languageCode: lang, url });
      }

      return url;
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
