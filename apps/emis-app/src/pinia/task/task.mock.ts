import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { getMockExtensionComponents } from '@/pinia/task/task-extension.mock';
import { mockTaskEntities, mockTaskMetadatum } from '@libs/entities-lib/task';

const storeId = 'task';

export const useMockTaskStore = (pinia? : TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useTaskStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockTaskEntities()),
    ...getMockExtensionComponents(),
  }));

  const useTaskMetadataStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockBaseStoreComponents(mockTaskMetadatum()),
  }));

  return {
    pinia: p,
    taskStore: useTaskStore(),
    taskMetadataStore: useTaskMetadataStore(),
  };
};
