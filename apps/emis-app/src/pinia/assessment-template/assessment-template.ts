import { httpClient } from '@/services/httpClient';
import { AssessmentTemplatesService } from '@libs/services-lib/assessment-template/entity';
import { getEntityStoreComponents } from '@libs/stores-lib/base';

import { IAssessmentTemplateEntity, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-template-extension';

export type Entity = IAssessmentTemplateEntity;

const storeId = 'assessment-template';
const entityService = new AssessmentTemplatesService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentTemplateStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
