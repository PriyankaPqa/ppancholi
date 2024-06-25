import { mockItemStates, mockSearchStates, useMockUiStateStore } from '@/pinia/ui-state/uiState.mock';

const { uiStateStore } = useMockUiStateStore();

describe('>>> UiState Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSearchTableState', () => {
    it('should return correct data according the key', () => {
      uiStateStore.searchStates = mockSearchStates();
      const res = uiStateStore.getSearchTableState('key1');
      expect(res).toEqual(mockItemStates[0]);
    });
  });

  describe('getAllSearchIds', () => {
    it('returns the flat array of all searchResultIds', () => {
      uiStateStore.searchStates = mockSearchStates();

      const res = uiStateStore.getAllSearchIds();

      expect(res).toMatchObject(['1', '2']);
    });
  });

  describe('setSearchTableState', () => {
    it('sets the state for a key', () => {
      uiStateStore.searchStates = mockSearchStates();
      uiStateStore.setSearchTableState(
        'key3',
        {
          searchParams: { top: 3 },
          filterState: { filterStateItem: 3 },
          itemsCount: 3,
          options: { optionsItem: 3 },
          params: { search: '3' },
          previousPageIndex: 3,
          searchExecutionDate: new Date('2020-01-01'),
          searchResultIds: ['3'],
          userFilters: { userFiltersItem: 3 },
          userSearchFilters: 'userSearchFilters3',
        },
      );

      expect(uiStateStore.searchStates).toEqual([
          ...mockSearchStates(),
        {
          key: 'key3',
          state: {
          searchParams: { top: 3 },
          filterState: { filterStateItem: 3 },
          itemsCount: 3,
          options: { optionsItem: 3 },
          params: { search: '3' },
          previousPageIndex: 3,
          searchExecutionDate: new Date('2020-01-01'),
          searchResultIds: ['3'],
          userFilters: { userFiltersItem: 3 },
          userSearchFilters: 'userSearchFilters3',
        },
    },
        ]);
    });
  });
});
