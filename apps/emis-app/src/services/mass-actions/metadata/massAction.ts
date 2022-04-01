import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { IMassActionMetadata } from '@/entities/mass-action/massActions.types';
import { IMassActionMetadataService } from '@/services/mass-actions/metadata/massAction.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'mass-actions/metadata';

export class MassActionMetadataService extends DomainBaseService<IMassActionMetadata, uuid> implements IMassActionMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
