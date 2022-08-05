/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/services/http-client';

import { DomainBaseService } from '@libs/core-lib/services/base';
import { IEventMetadata } from '@libs/entities-lib/event';
import { IEventsMetadataService } from './events.types';

const apiUrlSuffix = 'event';
const controller = 'events/metadata';

export class EventsMetadataService extends DomainBaseService<IEventMetadata, uuid> implements IEventsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
