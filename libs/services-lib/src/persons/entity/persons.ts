import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { IPersonsService } from './persons.types';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'persons';

export class PersonsService extends DomainBaseService<IMemberEntity, uuid> implements IPersonsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
