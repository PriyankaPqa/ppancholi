import { mockStore } from '@/store';
import { UI_STATE } from '@/constants/vuex-modules';
import { UIStateStorage } from './storage';

const entityModuleName = UI_STATE;

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {},
    },
  },
}, { commit: true, dispatch: true });

const storage = new UIStateStorage(store, entityModuleName).make();

describe('>>> UIState Storage', () => {
  describe('>> Getters', () => {
    describe('getSearchTableState', () => {
      it('should proxy getSearchTableState', () => {
        const storageGetter = storage.getters.getSearchTableState('key1');
        const storeGetter = store.getters[`${entityModuleName}/getSearchTableState`]('key1');
        expect(storageGetter).toEqual(storeGetter);
      });
    });

    describe('getAllSearchIds', () => {
      it('should proxy getAllSearchIds', () => {
        const storageGetter = storage.getters.getAllSearchIds();
        const storeGetter = store.getters[`${entityModuleName}/getAllSearchIds`];
        expect(storageGetter).toEqual(storeGetter);
      });
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setSearchTableState', () => {
      storage.mutations.setSearchTableState('key1', { name: 'state1' });
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setSearchTableState`, { key: 'key1', state: { name: 'state1' } });
    });
  });
});
