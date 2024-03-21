import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { mockProgramEntities } from '@libs/entities-lib/program';
import { getMockExtensionComponents } from '@/pinia/program/program-extension.mock';

// Should be the same as the original store
const storeId = 'program';

export const useMockProgramStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useProgramStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockProgramEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    programStore: useProgramStore(),
  };
};
