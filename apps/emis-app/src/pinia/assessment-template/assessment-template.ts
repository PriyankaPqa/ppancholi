import { httpClient } from '@/services/httpClient';
import { AssessmentTemplatesService } from '@libs/services-lib/assessment-template/entity';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { AssessmentTemplatesMetadataService } from '@libs/services-lib/assessment-template/metadata';

import { IAssessmentTemplateEntity, IAssessmentTemplateMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './assessment-template-extension';

export type Entity = IAssessmentTemplateEntity;
export type Metadata = IAssessmentTemplateMetadata;

const storeId = 'assessment-template';
const entityService = new AssessmentTemplatesService(httpClient);
const metadataService = new AssessmentTemplatesMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAssessmentTemplateStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useAssessmentTemplateMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
