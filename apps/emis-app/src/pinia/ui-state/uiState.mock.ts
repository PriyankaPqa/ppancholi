import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useUiStateStore } from '@/pinia/ui-state/uiState';
import { ItemState, IUIStateState } from '@/pinia/ui-state/uiState.type';

export const useMockUiStateStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const uiStateStore = useUiStateStore();

  return {
    pinia: p,
    uiStateStore,
  };
};

export const mockItemStates: ItemState[] = [
  {
    azureSearchParams: { top: 1 },
    filterState: { filterStateItem: 1 },
    itemsCount: 1,
    options: { optionsItem: 1 },
    params: { search: '1' },
    previousPageIndex: 1,
    searchExecutionDate: new Date(),
    searchResultIds: ['1'],
    userFilters: { userFiltersItem: 1 },
    userSearchFilters: 'userSearchFilters1',
  },
  {
    azureSearchParams: { top: 2 },
    filterState: { filterStateItem: 2 },
    itemsCount: 2,
    options: { optionsItem: 2 },
    params: { search: '2' },
    previousPageIndex: 2,
    searchExecutionDate: new Date(),
    searchResultIds: ['2'],
    userFilters: { userFiltersItem: 2 },
    userSearchFilters: 'userSearchFilters2',
  },
];

export const mockSearchStates = (): IUIStateState[] => ([
  { key: 'key1', state: mockItemStates[0] },
  { key: 'key2', state: mockItemStates[1] },
]);
