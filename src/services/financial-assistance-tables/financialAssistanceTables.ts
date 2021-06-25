import { ICreateFinancialAssistanceTableRequest, IFinancialAssistanceTableData } from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';
import { IHttpClient } from '@/services/httpClient';
import { IFinancialAssistanceTablesService } from './financialAssistanceTables.types';

export class FinancialAssistanceTablesService implements IFinancialAssistanceTablesService {
  constructor(private readonly http: IHttpClient) {}

  async createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableData> {
    const url = '/financial-assistance/financial-assistance-tables';

    return this.http.post(url, financialAssistance);
  }

  async fetchActiveCategories(): Promise<IOptionItem[]> {
    const url = '/financial-assistance/financial-assistance-categories';

    return this.http.get(url);
  }
}
