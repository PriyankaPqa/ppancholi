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
    getAllSearchIds: (state: IUIStateState) => state.searchStates
      /* eslint-disable @typescript-eslint/no-explicit-any */
      .filter((item) => (item.state as any).searchResultIds !== undefined)
      .map((item) => (item.state as any).searchResultIds)
      .reduce((acc, ids) => acc.concat(ids), []),
  }

  public mutations = {
    setSearchTableState(state: IUIStateState, payload: { key: string, state: unknown }) {
      state.searchStates = state.searchStates.filter((s) => s.key !== payload.key);
      state.searchStates.push(payload);
    },
  }
}
