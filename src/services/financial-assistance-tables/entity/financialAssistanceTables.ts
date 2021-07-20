import {
  ICreateFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
} from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IFinancialAssistanceTablesService } from './financialAssistanceTables.types';

const API_URL_SUFFIX = 'financial-assistance';
const CONTROLLER = 'financial-assistance-tables';

export class FinancialAssistanceTablesService extends DomainBaseService<IFinancialAssistanceTableEntity, uuid>
  implements IFinancialAssistanceTablesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity> {
    return this.http.post(this.baseUrl, financialAssistance);
  }

  async fetchActiveCategories(): Promise<IOptionItem[]> {
    return this.http.get(`/${API_URL_SUFFIX}/financial-assistance-categories`);
  }
}
