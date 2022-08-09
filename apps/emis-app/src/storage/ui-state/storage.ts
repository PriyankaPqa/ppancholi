import { IStore, IState } from '../../store/store.types';
import { IStorage } from './storage.types';

export class UIStateStorage implements IStorage {
  protected store: IStore<IState>;

  protected readonly entityModuleName;

  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    this.store = pStore;
    this.entityModuleName = pEntityModuleName;
  }

  private getters = {
    getSearchTableState: (key: string) => this.store.getters[`${this.entityModuleName}/getSearchTableState`](key),
    getAllSearchIds: () => this.store.getters[`${this.entityModuleName}/getAllSearchIds`],
  }

  private mutations = {
    setSearchTableState: (key: string, state: unknown) => {
      this.store.commit(`${this.entityModuleName}/setSearchTableState`, { key, state });
    },
  }

  public make = () => ({
    getters: this.getters,
    mutations: this.mutations,
  })
}
