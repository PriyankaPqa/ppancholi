import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';

import { ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { defineStore } from 'pinia';

import { CaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { getExtensionComponents } from './case-file-document-extension';

export type Entity = ICaseFileDocumentEntity;
export type IdParams = { id: uuid, caseFileId: uuid };

const storeId = 'case-file-document';
const entityService = new CaseFileDocumentsService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useCaseFileDocumentStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
