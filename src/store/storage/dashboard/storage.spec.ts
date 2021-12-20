/**
 * @group storage
 */

import { mockStore } from '@/store';
import { IState } from '@/store/modules/dashboard';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Dashboard Storage', () => {
  describe('>> Mutations', () => {
    it('should proxy setDashboardProperty', () => {
      const payload = { property: 'leftMenuExpanded' as keyof IState, value: true };
      storage.mutations.setProperty(payload);
      expect(store.commit).toBeCalledWith('dashboard/setProperty', payload);
    });
  });
});
