import { IProgramMetadata } from '@/entities/program';
import { BaseModule } from '@/store/modules/base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export class ProgramMetadataModule extends BaseModule<IProgramMetadata, UrlParams> {}
