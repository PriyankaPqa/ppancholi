import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockUserAccountEntities, mockUserAccountMetadatum } from '@libs/entities-lib/user-account';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockUserAccountExtensionComponents } from '@/pinia/user-account/user-account-extension.mock';

const storeId = 'user-account';

export const useMockUserAccountStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useUserAccountStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockUserAccountEntities()),
    ...getMockUserAccountExtensionComponents(),
  }));

  const useUserAccountMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockUserAccountMetadatum()),
  }));
  return {
    pinia: p,
    userAccountStore: useUserAccountStore(),
    userAccountMetadataStore: useUserAccountMetadataStore(),
  };
};
