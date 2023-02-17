import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { FinancialAssistanceTablesMetadataService } from '@libs/services-lib/financial-assistance-tables/metadata';
import { IdParams, IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata } from '@libs/entities-lib/financial-assistance';
import { getExtensionComponents } from './financial-assistance-extension';

export type Entity = IFinancialAssistanceTableEntity;
export type Metadata = IFinancialAssistanceTableMetadata;

const storeId = 'financial-assistance';
const entityService = new FinancialAssistanceTablesService(httpClient);
const metadataService = new FinancialAssistanceTablesMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useFinancialAssistanceStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useFinancialAssistanceMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
