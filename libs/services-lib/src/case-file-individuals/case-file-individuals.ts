import { ICaseFileIndividualEntity, IdParams } from '@libs/entities-lib/case-file-individual';
import { IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { ICaseFileIndividualsService } from './case-file-individuals.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'individuals';

export class CaseFileIndividualsService extends DomainBaseService<ICaseFileIndividualEntity, IdParams>
  implements ICaseFileIndividualsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async createCaseFileIndividual(item: ICaseFileIndividualEntity): Promise<ICaseFileIndividualEntity> {
    return this.http.post<ICaseFileIndividualEntity>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }
}
