import { IStore, IState } from '@/store/store.types';
import { IMassActionEntity, IMassActionMetadata } from '@/entities/mass-action';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class MassActionStorage extends Base<IMassActionEntity, IMassActionMetadata, uuid> implements IStorage {
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
