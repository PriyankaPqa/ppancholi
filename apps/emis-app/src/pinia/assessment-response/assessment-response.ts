import { httpClient } from '@/services/httpClient';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { AssessmentResponsesMetadataService } from '@libs/services-lib/assessment-response/metadata';

import { IAssessmentResponseEntity, IAssessmentResponseMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-response-extension';

export type Entity = IAssessmentResponseEntity;
export type Metadata = IAssessmentResponseMetadata;

const storeId = 'assessment-response';
const entityService = new AssessmentResponsesService(httpClient);
const metadataService = new AssessmentResponsesMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentResponseStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useAssessmentResponseMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
