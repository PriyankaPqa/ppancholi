import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IProgramEntity, IProgramMetadata, IdParams } from '@libs/entities-lib/program';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { ProgramsMetadataService } from '@libs/services-lib/programs/metadata';
import { getExtensionComponents } from './program-extension';

export type Entity = IProgramEntity;
export type Metadata = IProgramMetadata;

const storeId = 'program';
const entityService = new ProgramsService(httpClient);
const metadataService = new ProgramsMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useProgramStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useProgramMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
