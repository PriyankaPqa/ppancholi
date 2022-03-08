import { mockStore } from '@/store';

const store = mockStore();

describe('>>> Mutations', () => {
  describe('>> setProperty', () => {
    test('It should set the property', () => {
      expect(store.state.dashboard.leftMenuExpanded).toBeFalsy();
      store.commit('dashboard/setProperty', { property: 'leftMenuExpanded', value: true });
      expect(store.state.dashboard.leftMenuExpanded).toBeTruthy();
    });
  });
});
