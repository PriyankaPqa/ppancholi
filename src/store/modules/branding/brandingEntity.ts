/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';
import {
  BrandingEntity, IBrandingEntity, IBrandingEntityData, IEditColoursRequest, IEditTenantDetailsRequest,
} from '@/entities/branding';
import { BrandingsService } from '@/services/brandings/entity';
import { IBrandingEntityState } from './brandingEntity.types';
import vuetify from '@/ui/plugins/vuetify/vuetify';

export class BrandingEntityModule extends BaseModule<IBrandingEntity, uuid> {
  constructor(readonly service: BrandingsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: (this.actions as unknown) as ActionTree<IState<IBrandingEntity>, IRootState>,
  });

  public state: IBrandingEntityState = {
    ...this.baseState,

    branding: null,
    logoUrl: {
      en: '/img/placeholder-logo-en.png',
      fr: '/img/placeholder-logo-fr.png',
    },
  };

  public getters = {
    ...this.baseGetters,

    branding: (state: IBrandingEntityState) => state.branding,
    logoUrl: (state: IBrandingEntityState) => (languageCode: 'en' | 'fr'): string => {
      if (languageCode !== 'en' && languageCode !== 'fr') {
        return state.logoUrl.en;
      }

      return state.logoUrl[languageCode];
    },
  };

  public mutations = {
    ...this.baseMutations,

    setBranding: (state: IBrandingEntityState, brandingData: IBrandingEntityData) => {
      state.branding = new BrandingEntity(brandingData);

      this.updateTheme(state.branding);
    },

    setLogoUrl: (state: IBrandingEntityState, { languageCode, url }: { languageCode: 'en' | 'fr'; url: string }) => {
      state.logoUrl[languageCode] = url;
    },
  };

  public actions = {
    ...this.baseActions,

    getUserTenants: async (context: ActionContext<IBrandingEntityState, IBrandingEntityState>): Promise<IBrandingEntity[]> => {
      const results = await this.service.getUserTenants();

      if (results) {
        context.commit('setAll', results);
        return results.map((r) => new BrandingEntity(r));
      }
      return [];
    },

    getBranding: async (context: ActionContext<IBrandingEntityState, IBrandingEntityState>): Promise<IBrandingEntity> => {
      const result = await this.service.getCurrentBranding();

      if (result) {
        context.commit('setBranding', result);
      }

      return new BrandingEntity(result);
    },

    updateColours: async (
      context: ActionContext<IBrandingEntityState, IBrandingEntityState>,
      payload: IEditColoursRequest,
    ): Promise<IBrandingEntity> => {
      const result = await this.service.updateColours(payload);

      if (result) {
        context.commit('setBranding', result);
      }

      return new BrandingEntity(result);
    },

    updateTenantDetails: async (
      context: ActionContext<IBrandingEntityState, IBrandingEntityState>,
      payload: IEditTenantDetailsRequest,
    ): Promise<IBrandingEntity> => {
      const result = await this.service.updateTenantDetails(payload);

      if (result) context.commit('setBranding', result);

      return new BrandingEntity(result);
    },

    getLogoUrl: async (context: ActionContext<IBrandingEntityState, IBrandingEntityState>, languageCode: string): Promise<string> => {
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
    primary.lighten1 = colours.primaryLight;
    primary.darken1 = colours.primaryDark;

    const { secondary }: any = lightTheme;
    secondary.base = colours.secondary;
  }
}
