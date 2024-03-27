import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/approval-table/approval-table-extension';
import { IApprovalTableEntityData, IdParams } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';

export type EntityData = IApprovalTableEntityData;

const storeId = 'approval-table';
const entityService = new ApprovalTablesService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<IApprovalTableEntityData, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useApprovalTableStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
