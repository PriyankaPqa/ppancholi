/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';
import { IFeatureEntity } from '@/entities/feature';
import { FeaturesService } from '@/services/features/entity';
import { IFeatureEntityState } from './featureEntity.types';

export class FeatureEntityModule extends BaseModule<IFeatureEntity, uuid> {
  constructor(readonly service: FeaturesService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: (this.actions as unknown) as ActionTree<IState<IFeatureEntity>, IRootState>,
  });

  public state: IFeatureEntityState = {
    ...this.baseState,
  };

  public getters = {
    ...this.baseGetters,

    feature: (state: IFeatureEntityState) => (name: string): IFeatureEntity => state.items.find((i) => i.name === name),
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,

    enableFeature: async (context: ActionContext<IFeatureEntityState, IFeatureEntityState>, featureId: uuid): Promise<IFeatureEntity> => {
      const result = await this.service.enableFeature(featureId);
      if (result) {
        context.commit('set', result);
      }

      return result;
    },

    disableFeature: async (context: ActionContext<IFeatureEntityState, IFeatureEntityState>, featureId: uuid): Promise<IFeatureEntity> => {
      const result = await this.service.disableFeature(featureId);
      if (result) {
        context.commit('set', result);
      }

      return result;
    },
  };
}
