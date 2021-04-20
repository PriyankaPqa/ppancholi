import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Case File Storage', () => {
  describe('>> Actions', () => {
    it('should proxy searchCaseFiles', () => {
      const params = mockSearchParams;
      storage.actions.searchCaseFiles(params);
      expect(store.dispatch).toBeCalledWith('caseFile/searchCaseFiles', params);
    });
  });
});
