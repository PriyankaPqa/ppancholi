import { IUIStateState } from './uiState.types';

export class UIStateModule {
  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
  })

  public state = {
    searchStates: [] as { key: string, state: unknown }[],
  }

  public getters = {
    getSearchTableState: (state: IUIStateState) => (key: string) => state.searchStates.filter((s) => s.key === key)[0]?.state,
  }

  public mutations = {
    setSearchTableState(state: IUIStateState, payload: { key: string, state: unknown }) {
      state.searchStates = state.searchStates.filter((s) => s.key !== payload.key);
      state.searchStates.push(payload);
    },
  }
}
