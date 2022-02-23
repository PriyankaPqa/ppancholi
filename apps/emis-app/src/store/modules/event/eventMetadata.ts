import { BaseModule } from '@/store/modules/base';
import { IEventMetadata } from '@/entities/event';

export class EventMetadataModule extends BaseModule<IEventMetadata, uuid> {}
