import { httpClient } from '@/services/httpClient';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { getEntityStoreComponents } from '@libs/stores-lib/base';

import { IAssessmentFormEntity, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-form-extension';

export type Entity = IAssessmentFormEntity;

const storeId = 'assessment-form';
const entityService = new AssessmentFormsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentFormStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
