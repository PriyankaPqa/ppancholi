import { BaseModule } from '@/store/modules/base';
import { IEventMetadata } from '@libs/entities-lib/event';

export class EventMetadataModule extends BaseModule<IEventMetadata, uuid> {}
