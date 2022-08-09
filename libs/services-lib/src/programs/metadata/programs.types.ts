import { IProgramMetadata } from '@libs/entities-lib/program';
import { IDomainBaseService } from '../../base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export interface IProgramsMetadataService extends IDomainBaseService<IProgramMetadata, UrlParams> {}
