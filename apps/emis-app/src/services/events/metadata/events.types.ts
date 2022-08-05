import { IEventMetadata } from '@libs/entities-lib/event';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface IEventsMetadataService extends IDomainBaseService<IEventMetadata, uuid> {}
