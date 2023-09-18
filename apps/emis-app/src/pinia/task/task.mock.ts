import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { getMockExtensionComponents } from '@/pinia/task/task-extension.mock';
import { mockTaskEntities } from '@libs/entities-lib/task';

const storeId = 'task';

export const useMockTaskStore = (pinia? : TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useTaskStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockTaskEntities()),
    ...getMockExtensionComponents(),
  }));

  // TODO mock task metadata store

  return {
    pinia: p,
    taskStore: useTaskStore(),
  };
};
