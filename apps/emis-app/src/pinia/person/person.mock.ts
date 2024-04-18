import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { mockMember } from '@libs/entities-lib/value-objects/member';

// Should be the same as the original store
const storeId = 'person';

export const useMockPersonStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockMember()]),
    $reset: jest.fn(),
  }));

  return {
    pinia: p,
    personStore: useStore(),
  };
};
