import { IAddress } from '@/entities/value-objects/address';
import { IStore, IState } from '../../store.types';
import { Base } from '../base';
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

    // eslint-disable-next-line
    updateNoFixedHomeAddress: (householdId: string, observation: string): Promise<IHouseholdEntity> => this.store.dispatch(`${this.entityModuleName}/updateNoFixedHomeAddress`, { householdId, observation }),
    // eslint-disable-next-line
    updateHomeAddress: (householdId: string, address: IAddress): Promise<IHouseholdEntity> => this.store.dispatch(`${this.entityModuleName}/updateHomeAddress`, { householdId, address }),
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
