import { IProgramMetadata } from '@libs/entities-lib/program';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
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
