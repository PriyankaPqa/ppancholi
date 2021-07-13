/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@/services/httpClient';

import { DomainBaseService } from '@/services/base';
import { IEventMetadata } from '@/entities/event';
import { IEventsMetadataService } from './events.types';

const apiUrlSuffix = 'event';
const controller = 'events/metadata';

export class EventsMetadataService extends DomainBaseService<IEventMetadata> implements IEventsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
