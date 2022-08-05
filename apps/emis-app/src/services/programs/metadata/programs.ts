import { IProgramMetadata } from '@libs/entities-lib/program';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
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
