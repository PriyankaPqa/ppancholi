import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/household/household-extension.mock';
import { mockHouseholdEntity, mockHouseholdMetadata } from '@libs/entities-lib/household';

// Should be the same as the original store
const storeId = 'household';

export const useMockHouseholdStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockHouseholdEntity()]),
    ...getMockExtensionComponents(mockHouseholdEntity()),
    $reset: jest.fn(),
  }));

  const useMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents([mockHouseholdMetadata()]),
    $reset: jest.fn(),
  }));

  return {
    pinia: p,
    householdStore: useStore(),
    householdMetadataStore: useMetadataStore(),
  };
};
