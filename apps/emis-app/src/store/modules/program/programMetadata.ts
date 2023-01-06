import { IProgramMetadata } from '@libs/entities-lib/program';
import { BaseModule } from '@/store/modules/base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export class ProgramMetadataModule extends BaseModule<IProgramMetadata, UrlParams> {}
