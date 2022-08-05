import { IStore, IState } from '@libs/registration-lib/store/store.types';
import { IVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity';
import { IAddress } from '@libs/entities-lib/value-objects/address';
import { IHouseholdEntity, IHouseholdMetadata } from '@libs/entities-lib/household';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class HouseholdStorage extends Base<IHouseholdEntity, IHouseholdMetadata, uuid> implements IStorage {
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
    fetchHouseholdHistory: (household: IHouseholdEntity): Promise<IVersionedEntity[]> => this.store.dispatch(`${this.entityModuleName}/fetchHouseholdHistory`, household),
  }

  private mutations = {
    ...this.baseMutations,

    setSearchResultsShown: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setSearchResultsShown`, payload),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
