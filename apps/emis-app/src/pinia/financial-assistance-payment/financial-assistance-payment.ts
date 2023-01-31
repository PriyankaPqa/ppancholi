import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';

import { defineStore } from 'pinia';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';
import { IdParams, IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata } from '@libs/entities-lib/financial-assistance-payment';
import { getExtensionComponents } from './financial-assistance-payment-extension';

export type Entity = IFinancialAssistancePaymentEntity;
export type Metadata = IFinancialAssistancePaymentMetadata;

const storeId = 'financial-assistance-payment';
const entityService = new FinancialAssistancePaymentsService(httpClient);
const metadataService = new FinancialAssistancePaymentsMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useFinancialAssistancePaymentStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useFinancialAssistancePaymentMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
