import { ITaskEntity, IdParams, ITaskMetadata } from '@libs/entities-lib/task';
import { TaskService } from '@libs/services-lib/task/entity';
import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/task/task-extension';
import { defineStore } from 'pinia';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { TaskMetadataService } from '@libs/services-lib/task/metadata';

export type Entity = ITaskEntity;
export type Metadata = ITaskMetadata;

const storeId = 'task';
const entityService = new TaskService(httpClient);
const metadataService = new TaskMetadataService(httpClient);
const optionItemService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionItemService);

export const useTaskStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useTaskMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
