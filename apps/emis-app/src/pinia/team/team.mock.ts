import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockTeamEntities } from '@libs/entities-lib/team';
import { getMockExtensionComponents } from '@/pinia/team/team-extension.mock';

// Should be the same as the original store
const storeId = 'team';

export const useMockTeamStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useTeamStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockTeamEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    teamStore: useTeamStore(),
  };
};
