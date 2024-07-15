import { ref } from 'vue';

export function getMockBaseStoreComponents(items: Array<unknown>) {
  return {
    items: ref(items),
    newlyCreatedIds: ref([]),
    maxTimeInSecondsForNewlyCreatedIds: ref(60),
    getNewlyCreatedIds: jest.fn(() => []),
    getAll: jest.fn(() => items),
    getById: jest.fn(() => items[0]),
    getByCriteria: jest.fn(() => items),
    getByIds: jest.fn(() => items),
    getByIdsWithPinnedItems: jest.fn(() => items),
    set: jest.fn(() => items[0]),
    setAll: jest.fn(() => items),
    fetch: jest.fn(() => items[0]),
    fetchAll: jest.fn(() => items),
    fetchAllIncludingInactive: jest.fn(() => items),
    fetchByIds: jest.fn(() => items),
    addNewlyCreatedId: jest.fn(),
    setItemFromOutsideNotification: jest.fn(),
  };
}

export function getMockEntityStoreComponents(items: Array<unknown>) {
  return {
    ...getMockBaseStoreComponents(items),
    searchLoading: false,
    deactivate: jest.fn(() => items[0]),
    activate: jest.fn(() => items[0]),
    combinedSearch: jest.fn(() => ({ ids: ['1'], odataCount: 1, value: [{ entity: { id: '1' }, metadata: { id: '1' } }] })),
    search: jest.fn(() => ({ ids: ['1'], count: 1, values: items })),
    setSearchLoading: jest.fn(),
    setItemFromOutsideNotification: jest.fn(),
  };
}
