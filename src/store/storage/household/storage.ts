import { IStore, IState } from '../../../store/store.types';
import { Base } from '../../../store/storage/base';
import { IHouseholdEntity, IHouseholdMetadata } from '../../../entities/household';
import { IStorage } from './storage.types';

export class HouseholdStorage extends Base<IHouseholdEntity, IHouseholdMetadata> implements IStorage {
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
