import { IMassActionMetadata } from '@libs/entities-lib/mass-action/massActions.types';
import { IHttpClient } from '../../http-client';
import { IMassActionMetadataService } from './massAction.types';
import { DomainBaseService } from '../../base';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'mass-actions/metadata';

export class MassActionMetadataService extends DomainBaseService<IMassActionMetadata, uuid> implements IMassActionMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
