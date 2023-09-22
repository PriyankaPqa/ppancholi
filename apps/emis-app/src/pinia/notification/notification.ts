import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { INotificationEntity, IdParams } from '@libs/entities-lib/notification';
import { NotificationsService } from '@libs/services-lib/notifications/entity';
import { getExtensionComponents } from '@/pinia/notification/notification-extension';

export type Entity = INotificationEntity;

const storeId = 'notification';
const entityService = new NotificationsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useNotificationStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
