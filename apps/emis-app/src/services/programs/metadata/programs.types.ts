import { IProgramMetadata } from '@libs/entities-lib/program';
import { IDomainBaseService } from '@libs/core-lib/services/base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export interface IProgramsMetadataService extends IDomainBaseService<IProgramMetadata, UrlParams> {}
