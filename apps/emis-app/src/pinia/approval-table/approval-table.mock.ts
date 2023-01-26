import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockApprovalTableEntities, mockApprovalTableMetadatum } from '@libs/entities-lib/approvals/approvals-table';
import { getMockExtensionComponents } from '@/pinia/approval-table/approval-table-extension.mock';

const storeId = 'approval-table';

export const useMockApprovalTableStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useApprovalTableStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockApprovalTableEntities()),
    ...getMockExtensionComponents(),
  }));

  const useApprovalTableMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockApprovalTableMetadatum()),
  }));
  return {
    pinia: p,
    approvalTableStore: useApprovalTableStore(),
    approvalTableMetadataStore: useApprovalTableMetadataStore(),
  };
};
