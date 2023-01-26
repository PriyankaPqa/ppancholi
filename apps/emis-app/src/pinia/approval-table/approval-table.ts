import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/approval-table/approval-table-extension';
import { IApprovalTableEntityData, IApprovalTableMetadata, IdParams } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTablesMetadataService } from '@libs/services-lib/approval-tables/metadata/approvalTables';

export type EntityData = IApprovalTableEntityData;
export type Metadata = IApprovalTableMetadata;

const storeId = 'approval-table';
const entityService = new ApprovalTablesService(httpClient);
const metadataService = new ApprovalTablesMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<IApprovalTableEntityData, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useApprovalTableStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useApprovalTableMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
