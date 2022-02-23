import { ActionContext, ActionTree } from 'vuex';
import { IProgramEntity } from '@/entities/program';
import { IRootState } from '@/store/store.types';
import { ProgramsService } from '@/services/programs/entity';
import { IProgramEntityState } from './programEntity.types';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';

export class ProgramEntityModule extends BaseModule<IProgramEntity, { id: uuid; eventId: uuid }> {
  constructor(readonly service: ProgramsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: (this.actions as unknown) as ActionTree<IState<IProgramEntity>, IRootState>,
  });

  public state = {
    ...this.baseState,
  };

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,

    createProgram: async (context: ActionContext<IProgramEntityState, IProgramEntityState>, payload: IProgramEntity): Promise<IProgramEntity> => {
      const result = await this.service.createProgram(payload);
      if (result) {
        context.commit('addNewlyCreatedId', result);
        context.commit('set', result);
      }
      return result;
    },

    updateProgram: async (context: ActionContext<IProgramEntityState, IProgramEntityState>, payload: IProgramEntity): Promise<IProgramEntity> => {
      const result = await this.service.updateProgram(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  };
}
