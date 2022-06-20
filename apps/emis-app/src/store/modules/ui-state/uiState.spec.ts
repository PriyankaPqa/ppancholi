import { UIStateModule } from './uiState';

let myModule: UIStateModule;

describe('>>> UIState module', () => {
  beforeEach(() => {
    myModule = new UIStateModule();
  });

  describe('>> Getters', () => {
    describe('getSearchTableState', () => {
      it('returns the right table by key', () => {
        myModule.state.searchStates = [{ key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2' } }];

        const res = myModule.getters.getSearchTableState(myModule.state)('key2');

        expect(res).toEqual({ name: 'state2' });
      });
    });

    describe('getAllSearchIds', () => {
      it('returns the flat array of all searchResultIds', () => {
        myModule.state.searchStates = [
          { key: 'key1', state: { searchResultIds: ['1'] } },
          { key: 'key2', state: { searchResultIds: ['2'] } },
          { key: 'key2', state: { other: ['2'] } },
        ];

        const res = myModule.getters.getAllSearchIds(myModule.state);

        expect(res).toMatchObject(['1', '2']);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setSearchTableState', () => {
      it('sets the state for a key', () => {
        myModule.state.searchStates = [{ key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2' } }];
        const newState = { key: 'key2', state: { name: 'state2alpha' } };

        myModule.mutations.setSearchTableState(myModule.state, newState);

        expect(myModule.state.searchStates).toEqual([
          { key: 'key1', state: { name: 'state1' } }, { key: 'key2', state: { name: 'state2alpha' } }]);
      });
    });
  });
});
