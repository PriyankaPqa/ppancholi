import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { IdParams, IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { getExtensionComponents } from './financial-assistance-extension';

export type Entity = IFinancialAssistanceTableEntity;

const storeId = 'financial-assistance';
const entityService = new FinancialAssistanceTablesService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useFinancialAssistanceStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
