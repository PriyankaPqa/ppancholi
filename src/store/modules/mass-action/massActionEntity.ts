import { ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import { IMassActionEntity } from '@/entities/mass-action/massActions.types';
import { MassActionService } from '@/services/mass-actions/entity/massAction';
import { BaseModule } from '../base';

import { IState } from '../base/base.types';

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
  };
}
