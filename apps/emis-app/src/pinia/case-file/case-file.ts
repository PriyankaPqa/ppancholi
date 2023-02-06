import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';

import { defineStore } from 'pinia';
import { ICaseFileEntity, ICaseFileMetadata, IdParams } from '@libs/entities-lib/case-file';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { getExtensionComponents } from './case-file-extension';

export type Entity = ICaseFileEntity;
export type Metadata = ICaseFileMetadata;

const storeId = 'case-file';
const entityService = new CaseFilesService(httpClient);
const metadataService = new CaseFilesMetadataService(httpClient);
const optionItemService = new OptionItemsService(httpClient);

const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionItemService);

export const useCaseFileStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useCaseFileMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
