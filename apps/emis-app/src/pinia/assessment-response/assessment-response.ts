import { httpClient } from '@/services/httpClient';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { getEntityStoreComponents } from '@libs/stores-lib/base';

import { IAssessmentResponseEntity, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-response-extension';

export type Entity = IAssessmentResponseEntity;

const storeId = 'assessment-response';
const entityService = new AssessmentResponsesService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentResponseStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
