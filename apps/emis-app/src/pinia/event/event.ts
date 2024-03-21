import { httpClient } from '@/services/httpClient';
import { EventsService } from '@libs/services-lib/events/entity';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { OptionItemsService } from '@libs/services-lib/optionItems';

import { IEventEntity, IdParams } from '@libs/entities-lib/event';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './event-extension';

export type Entity = IEventEntity;

const storeId = 'event';
const entityService = new EventsService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useEventStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
