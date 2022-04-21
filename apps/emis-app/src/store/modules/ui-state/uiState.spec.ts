import { UIStateModule } from './uiState';

let module: UIStateModule;

describe('>>> UIState module', () => {
  beforeEach(() => {
    module = new UIStateModule();
  });

  describe('>> Getters', () => {
    describe('getSearchTableState', () => {
      it('returns the right table by key', () => {
        module.state.searchStates = [{ key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2' } }];

        const res = module.getters.getSearchTableState(module.state)('key2');

        expect(res).toEqual({ name: 'state2' });
      });
    });

    describe('getAllSearchIds', () => {
      it('returns the flat array of all searchResultIds', () => {
        module.state.searchStates = [
          { key: 'key1', state: { searchResultIds: ['1'] } },
          { key: 'key2', state: { searchResultIds: ['2'] } },
          { key: 'key2', state: { other: ['2'] } },
        ];

        const res = module.getters.getAllSearchIds(module.state);

        expect(res).toMatchObject(['1', '2']);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setSearchTableState', () => {
      it('sets the state for a key', () => {
        module.state.searchStates = [{ key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2' } }];
        const newState = { key: 'key2', state: { name: 'state2alpha' } };

        module.mutations.setSearchTableState(module.state, newState);

        expect(module.state.searchStates).toEqual([
          { key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2alpha' } }]);
      });
    });
  });
});
