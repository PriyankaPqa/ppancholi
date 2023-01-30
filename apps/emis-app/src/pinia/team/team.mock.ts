import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockTeamEntities, mockTeamMetadatum } from '@libs/entities-lib/team';
import { getMockExtensionComponents } from '@/pinia/team/team-extension.mock';

// Should be the same as the original store
const storeId = 'team';

export const useMockTeamStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useTeamStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockTeamEntities()),
    ...getMockExtensionComponents(),
  }));

  const useTeamMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockTeamMetadatum()),
  }));

  return {
    pinia: p,
    teamStore: useTeamStore(),
    teamMetadataStore: useTeamMetadataStore(),
  };
};
