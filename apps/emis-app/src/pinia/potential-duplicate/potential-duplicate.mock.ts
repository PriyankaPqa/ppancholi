import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';
import { getMockExtensionComponents } from './potential-duplicate-extension.mock';

const storeId = 'potential-duplicate';

export const useMockPotentialDuplicateStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const usePotentialDuplicateStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockPotentialDuplicateEntity()]),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    potentialDuplicateStore: usePotentialDuplicateStore(),
  };
};
