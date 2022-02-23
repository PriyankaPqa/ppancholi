import { IStore, IState } from '@/store';
import { IStorage } from './storage.types';

export class UIStateStorage implements IStorage {
  protected store: IStore<IState>;

  protected readonly entityModuleName;

  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    this.store = pStore;
    this.entityModuleName = pEntityModuleName;
  }

  private getters = {
    getSearchTableState:
      (route: string) => this.store.getters[`${this.entityModuleName}/getSearchTableState`](route),
  }

  private mutations = {
    setSearchTableState: (route: string, state: unknown) => {
      this.store.commit(`${this.entityModuleName}/setSearchTableState`, { route, state });
    },
  }

  public make = () => ({
    getters: this.getters,
    mutations: this.mutations,
  })
}
