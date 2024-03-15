import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockCaseFileReferralEntities } from '@libs/entities-lib/case-file-referral';
import { getMockCaseFileReferralExtensionComponents } from '@/pinia/case-file-referral/case-file-referral-extension.mock';

const storeId = 'case-file-referral';

export const useMockCaseFileReferralStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useCaseFileReferralStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFileReferralEntities()),
    ...getMockCaseFileReferralExtensionComponents(),
  }));

  return {
    pinia: p,
    caseFileReferralStore: useCaseFileReferralStore(),
  };
};
