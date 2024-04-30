import { httpClient } from '@/services/httpClient';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { AssessmentFormsMetadataService } from '@libs/services-lib/assessment-form/metadata';

import { IAssessmentFormEntity, IAssessmentFormMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-form-extension';

export type Entity = IAssessmentFormEntity;
export type Metadata = IAssessmentFormMetadata;

const storeId = 'assessment-form';
const entityService = new AssessmentFormsService(httpClient);
const metadataService = new AssessmentFormsMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentFormStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useAssessmentFormMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
