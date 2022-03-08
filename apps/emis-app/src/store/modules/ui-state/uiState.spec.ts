import { UIStateModule } from './uiState';

let module: UIStateModule;

describe('>>> UIState module', () => {
  beforeEach(() => {
    module = new UIStateModule();
  });

  describe('>> Getters', () => {
    describe('getSearchTableState', () => {
      it('returns the right table by route', () => {
        module.state.searchStates = [{ route: 'route1', state: { name: 'state1' } }, { route: 'route2', state: { name: 'state2' } }];

        const res = module.getters.getSearchTableState(module.state)('route2');

        expect(res).toEqual({ name: 'state2' });
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setSearchTableState', () => {
      it('sets the state for a route', () => {
        module.state.searchStates = [{ route: 'route1', state: { name: 'state1' } }, { route: 'route2', state: { name: 'state2' } }];
        const newState = { route: 'route2', state: { name: 'state2alpha' } };

        module.mutations.setSearchTableState(module.state, newState);

        expect(module.state.searchStates).toEqual([
          { route: 'route1', state: { name: 'state1' } }, { route: 'route2', state: { name: 'state2alpha' } }]);
      });
    });
  });
});
