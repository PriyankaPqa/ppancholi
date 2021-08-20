import { IProgramMetadata } from '@/entities/program';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IProgramsMetadataService } from './programs.types';

const API_URL_SUFFIX = 'event/events/{eventId}';
const ENTITY = 'programs/metadata';
interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export class ProgramsMetadataService extends DomainBaseService<IProgramMetadata, UrlParams>
  implements IProgramsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
