import { IEventMetadata } from '@/entities/event';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface IEventsMetadataService extends IDomainBaseService<IEventMetadata, uuid> {}
