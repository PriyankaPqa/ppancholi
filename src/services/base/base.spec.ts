import { mockHttp } from '@/services/httpClient.mock';
import { DomainBaseService } from './base';

const http = mockHttp();

const API_URL_SUFFIX = 'API_URL_SUFFIX';
const CONTROLLER = 'CONTROLLER';

describe('>>> Domain Base Service', () => {
  const service = new DomainBaseService(http as never, API_URL_SUFFIX, CONTROLLER);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should build baseUrl correctly', () => {
      expect(service.baseUrl).toBe(`${API_URL_SUFFIX}/${CONTROLLER}`);
    });
  });

  describe('get', () => {
    it('should call the proper endpoint', async () => {
      const id = '123';
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}`);
    });
  });

  describe('getAll', () => {
    it('should call the proper endpoint', async () => {
      await service.getAll();
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}`);
    });
  });

  describe('getAllIncludingInactive', () => {
    it('should call the proper endpoint', async () => {
      await service.getAllIncludingInactive();
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/all`);
    });
  });

  describe('activate', () => {
    it('should call the proper endpoint', async () => {
      const id = '123';
      await service.activate(id);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/active`);
    });
  });

  describe('deactivate', () => {
    it('should call the proper endpoint', async () => {
      const id = '123';
      await service.deactivate(id);
      expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${id}`);
    });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: '123' };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: '123' };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith(`search/${CONTROLLER}`, { params, isOData: true });
    });
  });
});
