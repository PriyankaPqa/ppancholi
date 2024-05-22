import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { defineStore } from 'pinia';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { IdParams, IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { getExtensionComponents } from './financial-assistance-payment-extension';

export type Entity = IFinancialAssistancePaymentEntity;

const storeId = 'financial-assistance-payment';
const entityService = new FinancialAssistancePaymentsService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useFinancialAssistancePaymentStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
