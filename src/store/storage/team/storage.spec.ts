import { mockStore } from '@/store';

import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> Team Storage', () => {
  describe('>> Actions', () => {
    it('should proxy searchTeams', () => {
      storage.actions.searchTeams({});
      expect(store.dispatch).toBeCalledWith('team/searchTeams', {});
    });
  });
});
