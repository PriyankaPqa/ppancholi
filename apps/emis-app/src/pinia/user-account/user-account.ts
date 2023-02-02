import { httpClient } from '@/services/httpClient';
import { IdParams, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { UserAccountsMetadataService } from '@libs/services-lib/user-accounts/metadata';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { defineStore } from 'pinia';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { getExtensionComponents } from '@/pinia/user-account/user-account-extension';

export type Entity = IUserAccountEntity;
export type Metadata = IUserAccountMetadata;

const storeId = 'user-account';
const entityService = new UserAccountsService(httpClient);
const metadataService = new UserAccountsMetadataService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useUserAccountStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useUserAccountMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService),
}));
