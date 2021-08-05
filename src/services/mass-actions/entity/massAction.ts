import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IMassActionService } from '@/services/mass-actions/entity/massAction.types';
import { IMassActionEntity } from '@/entities/mass-action/massActions.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'mass-actions';

export class MassActionService extends DomainBaseService<IMassActionEntity, uuid> implements IMassActionService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
