/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEventMetadata } from '@libs/entities-lib/event';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { IEventsMetadataService } from './events.types';

const apiUrlSuffix = 'event';
const controller = 'events/metadata';

export class EventsMetadataService extends DomainBaseService<IEventMetadata, uuid> implements IEventsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
