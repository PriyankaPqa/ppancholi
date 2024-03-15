import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import {
  ICaseNoteEntity, IdParams,
} from '@libs/entities-lib/case-note';
import { CaseNotesService } from '@libs/services-lib/case-notes/entity';
import { getExtensionComponents } from '@/pinia/case-note/case-note-extension';

export type Entity = ICaseNoteEntity;

const storeId = 'case-note';
const entityService = new CaseNotesService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useCaseNoteStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
