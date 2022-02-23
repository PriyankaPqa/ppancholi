import { IUIStateState } from './uiState.types';

export class UIStateModule {
  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
  })

  public state = {
    searchStates: [] as { route: string, state: unknown }[],
  }

  public getters = {
    getSearchTableState: (state: IUIStateState) => (route: string) => state.searchStates.filter((s) => s.route === route)[0]?.state,
  }

  public mutations = {
    setSearchTableState(state: IUIStateState, payload: { route: string, state: unknown }) {
      state.searchStates = state.searchStates.filter((s) => s.route !== payload.route);
      state.searchStates.push(payload);
    },
  }
}
