import { IStore, IState } from '@/store/store.types';
import { Base } from '../base';
import { IStorage } from './storage.types';
import { IOptionItem } from '@/entities/optionItem';

export class FinancialAssistanceCategoryStorage extends Base<IOptionItem, never, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    super(pStore, pEntityModuleName, null);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,
  }

  private mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
