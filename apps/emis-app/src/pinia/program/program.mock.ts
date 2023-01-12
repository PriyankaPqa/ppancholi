import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { mockProgramEntities, mockProgramMetadataArray } from '@libs/entities-lib/program';
import { getMockExtensionComponents } from '@/pinia/program/program-extension.mock';

// Should be the same as the original store
const storeId = 'program';

export const useMockProgramStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useProgramStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockProgramEntities()),
    ...getMockExtensionComponents(),
  }));

  const useProgramMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockProgramMetadataArray()),
  }));

  return {
    pinia: p,
    programStore: useProgramStore(),
    programMetadataStore: useProgramMetadataStore(),
  };
};
