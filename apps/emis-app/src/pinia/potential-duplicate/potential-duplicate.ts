import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import {
  IPotentialDuplicateEntity, IdParams } from '@libs/entities-lib/potential-duplicate';
import { PotentialDuplicatesService } from '@libs/services-lib/potential-duplicates/entity';
import { getExtensionComponents } from '@/pinia/potential-duplicate/potential-duplicate-extension';

export type Entity = IPotentialDuplicateEntity;

const storeId = 'potential-duplicate';
const entityService = new PotentialDuplicatesService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const usePotentialDuplicateStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
