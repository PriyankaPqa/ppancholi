import { ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { FinancialAssistanceCategoriesService } from '@libs/services-lib/financial-assistance-categories/entity';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { IState } from '../base/base.types';
import { BaseModule } from '../base';

export class FinancialAssistanceCategoryEntityModule extends BaseModule <IOptionItem, uuid> {
  constructor(readonly service: FinancialAssistanceCategoriesService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
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
