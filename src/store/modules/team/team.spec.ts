import { Store } from 'vuex';

import { mockStore, IRootState } from '@/store';

describe('>>> Event Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({

    });
  });

  describe('>> Getters', () => {
    it('should contain at least one test', () => {
      expect(true).toBeTruthy();
    });
  });

  // describe('>> Mutations', () => {

  // });

  // describe('>> Actions', () => {

  // });
});
