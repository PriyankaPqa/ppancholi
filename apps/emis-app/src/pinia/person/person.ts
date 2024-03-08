import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { PersonsService } from '@libs/services-lib/persons/entity';

export type Entity = IMemberEntity;

const storeId = 'person';
const entityService = new PersonsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, uuid>(entityService);

export const usePersonStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
}));
