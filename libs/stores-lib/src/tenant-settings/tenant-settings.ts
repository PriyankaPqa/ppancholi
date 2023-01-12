import { defineStore } from 'pinia';
import { IdParams, ITenantSettingsEntity } from '@libs/entities-lib/tenantSettings';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { ISignalRInstance } from '@libs/shared-lib/signal-r';
import { IHttpClient } from '@libs/services-lib/http-client';
import { TenantSettingsStore } from './tenant-settings.types';
import { getEntityStoreComponents } from '../base';
import { getExtensionComponents } from './tenant-settings-extension';

export type Entity = ITenantSettingsEntity;
export type Metadata = never;

const storeId = 'tenant-settings';

/**
 *  TODO Need to understand how to properly define a store with typescript or find out why types are lost when components coming from a method.
 *  Until then we partially type the store with method we defined, but methods coming from Pinia won't be available https://github.com/vuejs/pinia/discussions/1924
 */
export function storeFactory(httpClient: IHttpClient, signalR: ISignalRInstance) {
  const entityService = new TenantSettingsService(httpClient);

  const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService, signalR);
  const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

  return defineStore(`${storeId}-entities`, () => ({
    ...baseEntityComponents,
    ...extensionComponents,
  }))() as unknown as TenantSettingsStore;
}
