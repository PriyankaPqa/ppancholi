import {
  ICreateFinancialAssistanceTableRequest,
  IEditFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItemData,
} from '@libs/entities-lib/financial-assistance';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';

import { IEntity } from '@libs/entities-lib/src/base';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IFinancialAssistanceTablesService } from './financialAssistanceTables.types';

const API_URL_SUFFIX = 'finance';
const CONTROLLER = 'financial-assistance-tables';

export class FinancialAssistanceTablesService extends DomainBaseService<IFinancialAssistanceTableEntity, uuid>
  implements IFinancialAssistanceTablesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity> {
    return this.http.post(this.baseUrl, financialAssistance);
  }

  async editFinancialAssistanceTable(
    faId: uuid,
    financialAssistance: IEditFinancialAssistanceTableRequest,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.patch(`${this.baseUrl}/${faId}`, financialAssistance);
  }

  async createItem(
    faId: uuid,
    item: IFinancialAssistanceTableItemData,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.post(`${this.baseUrl}/${faId}/items`, item);
  }

  async createSubItem(
    faId: uuid,
    itemId: uuid,
    subItem: IFinancialAssistanceTableSubItemData,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.post(`${this.baseUrl}/${faId}/items/${itemId}/sub-items`, subItem);
  }

  async editSubItem(
    faId: uuid,
    itemId: uuid,
    subItemId: uuid,
    subItem: IFinancialAssistanceTableSubItemData,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.patch(`${this.baseUrl}/${faId}/items/${itemId}/sub-items/${subItemId}`, subItem);
  }

  async deleteItem(
    faId: uuid,
    itemId: uuid,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.delete(`${this.baseUrl}/${faId}/items/${itemId}`);
  }

  async deleteSubItem(
    faId: uuid,
    itemId: uuid,
    subItemId: uuid,
  ): Promise<IFinancialAssistanceTableEntity> {
    return this.http.delete(`${this.baseUrl}/${faId}/items/${itemId}/sub-items/${subItemId}`);
  }

  async fetchByProgramId(programId: uuid): Promise<IFinancialAssistanceTableEntity[]> {
    return this.http.get(`${API_URL_SUFFIX}/programs/${programId}/${CONTROLLER}`);
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IFinancialAssistanceTableEntity, IEntity>> {
    return this.http.get('finance/search/financial-assistance-tablesV2', { params, isOData: true });
  }
}
