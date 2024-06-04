import { httpClient } from '@/services/httpClient';
import { ICaseFileIndividualEntity, IdParams } from '@libs/entities-lib/case-file-individual';
import { CaseFileIndividualsService } from '@libs/services-lib/case-file-individuals';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/case-file-individual/case-file-individual-extension';

export type Entity = ICaseFileIndividualEntity;

const storeId = 'case-file-individual';
const entityService = new CaseFileIndividualsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useCaseFileIndividualStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
