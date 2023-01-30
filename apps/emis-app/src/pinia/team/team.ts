import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/team/team-extension';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { IdParams, ITeamEntity, ITeamMetadata } from '@libs/entities-lib/team';
import { TeamsMetadataService } from '@libs/services-lib/teams/metadata';

export type Entity = ITeamEntity;
export type Metadata = ITeamMetadata;

const storeId = 'team';
const entityService = new TeamsService(httpClient);
const metadataService = new TeamsMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useTeamStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useTeamMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
