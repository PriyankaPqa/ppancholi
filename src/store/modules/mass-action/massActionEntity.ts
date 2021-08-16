import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import { IMassActionEntity, MassActionRunType } from '@/entities/mass-action/massActions.types';
import { MassActionService } from '@/services/mass-actions/entity/massAction';
import { BaseModule } from '../base';

import { IState } from '../base/base.types';
import { IMassActionEntityState } from '@/store/modules/mass-action/massActionEntity.types';

export class MassActionEntityModule extends BaseModule <IMassActionEntity, uuid> {
  constructor(readonly service: MassActionService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IMassActionEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,

    process: async (
      context: ActionContext<IMassActionEntityState, IMassActionEntityState>,
      { id, runType }: {id: string; runType: MassActionRunType},
    ): Promise<IMassActionEntity> => {
      const data = await this.service.process(id, runType);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    update: async (
      context: ActionContext<IMassActionEntityState, IMassActionEntityState>,
      { id, payload }: {id: string; payload: { name: string; description: string }},
    ): Promise<IMassActionEntity> => {
      const data = await this.service.update(id, payload);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },
  };
}
