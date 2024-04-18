import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/household/household-extension';
import { IHouseholdEntity, IdParams } from '@libs/entities-lib/household';
import { HouseholdsService } from '@libs/services-lib/households/entity';

export type Entity = IHouseholdEntity;

const storeId = 'household';
const entityService = new HouseholdsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useHouseholdStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
