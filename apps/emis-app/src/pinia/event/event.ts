import { httpClient } from '@/services/httpClient';
import { SignalR } from '@/ui/plugins/signal-r';
import { EventsService } from '@libs/services-lib/events/entity';
import { getBaseStoreComponents, getEntityStoreComponents } from '@libs/stores-lib/base';
import { EventsMetadataService } from '@libs/services-lib/events/metadata';
import { OptionItemsService } from '@libs/services-lib/optionItems';

import { IEventEntity, IEventMetadata, IdParams } from '@libs/entities-lib/event';
import { defineStore } from 'pinia';
import { getExtensionComponents } from './event-extension';

export type Entity = IEventEntity;
export type Metadata = IEventMetadata;

const storeId = 'event';
const entityService = new EventsService(httpClient);
const metadataService = new EventsMetadataService(httpClient);
const optionsService = new OptionItemsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService, SignalR);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService, optionsService);

export const useEventStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));

export const useEventMetadataStore = defineStore(`${storeId}-metadata`, () => ({
  ...getBaseStoreComponents<Metadata, IdParams>(metadataService, SignalR),
}));
