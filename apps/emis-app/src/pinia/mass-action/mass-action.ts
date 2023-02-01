import { IdParams, IMassActionEntity, IMassActionMetadata } from '@libs/entities-lib/mass-action';
import { httpClient } from '@/services/httpClient';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { MassActionMetadataService } from '@libs/services-lib/mass-actions/metadata';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/mass-action/mass-action-extension';

export type Entity = IMassActionEntity;
export type Metadata = IMassActionMetadata;

const storeId = 'mass-action';
const entityService = new MassActionService(httpClient);
const metadataService = new MassActionMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useMassActionStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useMassActionMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, uuid>(metadataService),
}));
