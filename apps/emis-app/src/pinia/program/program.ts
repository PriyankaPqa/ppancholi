import { httpClient } from '@/services/httpClient';
import { SignalR } from '@/ui/plugins/signal-r';
import { getBaseStoreComponents, getEntityStoreComponents } from '@/pinia/base';
import { defineStore } from 'pinia';
import { IProgramEntity, IProgramMetadata } from '@libs/entities-lib/program';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { ProgramsMetadataService } from '@libs/services-lib/programs/metadata';
import { getExtensionComponents } from './program-extension';

export type Entity = IProgramEntity;
export type Metadata = IProgramMetadata;
export type IdParams = { id: string; eventId: string };

const storeId = 'program';
const entityService = new ProgramsService(httpClient);
const metadataService = new ProgramsMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService, SignalR);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useProgramStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useProgramMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService, SignalR),
}));
