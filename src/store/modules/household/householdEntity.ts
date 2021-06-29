import { ActionTree } from 'vuex';
import { IHouseholdEntity } from '../../../entities/household';
import { BaseModule, IState } from '../base';
import { HouseholdsService } from '../../../services/households/entity';

import { IRootState } from '../../store.types';

export class HouseholdEntityModule extends BaseModule <IHouseholdEntity> {
  constructor(readonly service: HouseholdsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IHouseholdEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  }

  public mutations = {
    ...this.baseMutations,
  }

  public actions = {
    ...this.baseActions,
  }
}
