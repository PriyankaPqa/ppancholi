import {
  mockFinancialAssistanceTableEntity, mockItemData, mockSubItemData,
} from '@/entities/financial-assistance';
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

  describe('edit financial assistance table', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockFinancialAssistanceTableEntity();
      await service.editFinancialAssistanceTable('faId', payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/faId`, payload);
    });
  });

  describe('fetch financial assistance categories', () => {
    it('is linked to the correct URL and params', async () => {
      await service.fetchActiveCategories();
      expect(http.get).toHaveBeenCalledWith('/financial-assistance/financial-assistance-categories');
    });
  });

  describe('create item', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockItemData();
      await service.createItem('faId', payload);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/faId/items`, payload);
    });
  });

  describe('create subItem', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockSubItemData();
      await service.createSubItem('faId', 'itemId', payload);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/faId/items/itemId/sub-items`, payload);
    });
  });

  describe('edit subItem', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockSubItemData();
      await service.editSubItem('faId', 'itemId', 'subItemId', payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/faId/items/itemId/sub-items/subItemId`, payload);
    });
  });

  describe('delete subItem', () => {
    it('is linked to the correct URL and params', async () => {
      await service.deleteSubItem('faId', 'itemId', 'subItemId');
      expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/faId/items/itemId/sub-items/subItemId`);
    });
  });

  describe('delete item', () => {
    it('is linked to the correct URL and params', async () => {
      await service.deleteItem('faId', 'itemId');
      expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/faId/items/itemId`);
    });
  });
});
