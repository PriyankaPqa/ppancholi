// Should be the same as the original store
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { getMockExtensionComponents } from '@/pinia/mass-action/mass-action-extension.mock';
import { mockMassActionEntities, mockMassActionMetadataArray } from '@libs/entities-lib/mass-action';

const storeId = 'mass-action';

export const useMockMassActionStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useMassActionStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockMassActionEntities()),
    ...getMockExtensionComponents(),
  }));

  const useMassActionMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockMassActionMetadataArray()),
  }));

  return {
    pinia: p,
    massActionStore: useMassActionStore(),
    massActionMetadataStore: useMassActionMetadataStore(),
  };
};
