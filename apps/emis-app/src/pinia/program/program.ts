import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IProgramEntity, IdParams } from '@libs/entities-lib/program';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { getExtensionComponents } from './program-extension';

export type Entity = IProgramEntity;

const storeId = 'program';
const entityService = new ProgramsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useProgramStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
