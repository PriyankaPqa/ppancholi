import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/team/team-extension';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { IdParams, ITeamEntity } from '@libs/entities-lib/team';

export type Entity = ITeamEntity;

const storeId = 'team';
const entityService = new TeamsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useTeamStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
