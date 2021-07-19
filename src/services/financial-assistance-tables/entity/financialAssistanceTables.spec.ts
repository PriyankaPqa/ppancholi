import { mockFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { mockHttp } from '@/services/httpClient.mock';
import { FinancialAssistanceTablesService } from './financialAssistanceTables';

const http = mockHttp();

describe('>>> Financial assistance table Service', () => {
  const service = new FinancialAssistanceTablesService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create financial assistance table', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockFinancialAssistanceTableEntity();
      await service.createFinancialAssistanceTable(payload);
      expect(http.post).toHaveBeenCalledWith(service.baseUrl, payload);
    });
  });

  describe('create financial assistance table', () => {
    it('is linked to the correct URL and params', async () => {
      await service.fetchActiveCategories();
      expect(http.get).toHaveBeenCalledWith('/financial-assistance/financial-assistance-categories');
    });
  });
});
