import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockEventEntities } from '@libs/entities-lib/event';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/event/event-extension.mock';

// Should be the same as the original store
const storeId = 'event';

export const useMockEventStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useEventStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockEventEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    eventStore: useEventStore(),
  };
};
