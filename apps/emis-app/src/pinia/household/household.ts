import { httpClient } from '@/services/httpClient';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getExtensionComponents } from '@/pinia/household/household-extension';
import { IHouseholdEntity, IHouseholdMetadata, IdParams } from '@libs/entities-lib/household';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';

export type Entity = IHouseholdEntity;
export type Metadata = IHouseholdMetadata;

const storeId = 'household';
const entityService = new HouseholdsService(httpClient);
const metadataService = new HouseholdMetadataService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useHouseholdStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useHouseholdMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, uuid>(metadataService),
}));
