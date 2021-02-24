import { mockStore } from '@/store';

import { makeStorage } from './storage';

const store = mockStore({
  modules: {
    team: {
      state: {

      },
    },
  },
}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> User Storage', () => {
  describe('>> Getters', () => {
    it('should contain at least one test', () => {
      expect(true).toBeTruthy();
    });
  });

  // describe('>> Actions', () => {

  // });

  // describe('>> Mutations', () => {

  // });
});
