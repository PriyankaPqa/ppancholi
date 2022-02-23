import { ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { IOptionItem } from '@/entities/optionItem';
import { FinancialAssistanceCategoriesService } from '@/services/financial-assistance-categories/entity';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';

export class FinancialAssistanceCategoryEntityModule extends BaseModule <IOptionItem, uuid> {
  constructor(readonly service: FinancialAssistanceCategoriesService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IOptionItem>, IRootState>,
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
