import { IEventMetadata } from '@libs/entities-lib/event';
import { IDomainBaseService } from '../../base';

export interface IEventsMetadataService extends IDomainBaseService<IEventMetadata, uuid> {}
