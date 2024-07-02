import { ICaseFileIndividualEntity, IdParams, ReceivingAssistanceDetailCreateRequest, TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { CurrentAddress, ICurrentAddressData } from '@libs/entities-lib/value-objects/current-address';
import { IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { ICaseFileIndividualsService } from './case-file-individuals.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'case-file-individuals';

export class CaseFileIndividualsService extends DomainBaseService<ICaseFileIndividualEntity, IdParams>
  implements ICaseFileIndividualsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async createCaseFileIndividual(item: ICaseFileIndividualEntity): Promise<ICaseFileIndividualEntity> {
    return this.http.post<ICaseFileIndividualEntity>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }

  async addReceiveAssistanceDetails(caseFileId: uuid, id: uuid, item: ReceivingAssistanceDetailCreateRequest): Promise<ICaseFileIndividualEntity> {
    return this.http.patch<ICaseFileIndividualEntity>(this.getItemUrl(`${this.baseUrl}/{id}/add-receive-assistance-details`, { caseFileId, id }), item);
  }

  async addTemporaryAddress(caseFileId: uuid, id: uuid, item: ICurrentAddressData): Promise<ICaseFileIndividualEntity> {
    const payload = CurrentAddress.parseCurrentAddress(item);
    return this.http.patch<ICaseFileIndividualEntity>(this.getItemUrl(`${this.baseUrl}/{id}/add-temporary-address`, { caseFileId, id }), payload);
  }

  async editTemporaryAddress(caseFileId: uuid, id: uuid, item: TemporaryAddress): Promise<ICaseFileIndividualEntity> {
    return this.http.patch<ICaseFileIndividualEntity>(this.getItemUrl(`${this.baseUrl}/{id}/edit-temporary-address`, { caseFileId, id }), item);
  }
}
