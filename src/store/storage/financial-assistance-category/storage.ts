import { IStore, IState } from '@/store/store.types';
import { Base } from '../base';
import { IStorage } from './storage.types';
import { IOptionItem, IOptionItemMetadata } from '@/entities/optionItem';

export class FinancialAssistanceCategoryStorage extends Base<IOptionItem, IOptionItemMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
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
