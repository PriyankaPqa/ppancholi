import { mockHttp } from '@libs/core-lib/services/http-client';
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
      expect(service.baseUrl).toBe(`${process.env.VUE_APP_API_BASE_URL}/${API_URL_SUFFIX}/${CONTROLLER}`);
    });
  });

  describe('get', () => {
    it('should call the proper endpoint and use global handler ', async () => {
      const id = '123';
      await service.get(id, true);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}`, { globalHandler: true });
    });
    it('should call the proper endpoint and not use global handler ', async () => {
      const id = '123';
      await service.get(id, false);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}`, { globalHandler: false });
    });
  });

  describe('getFullResponse', () => {
    it('should call the proper endpoint and use global handler ', async () => {
      const id = '123';
      await service.getFullResponse(id, true);
      expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${id}`, { globalHandler: true });
    });
    it('should call the proper endpoint and not use global handler ', async () => {
      const id = '123';
      await service.getFullResponse(id, false);
      expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${id}`, { globalHandler: false });
    });
  });

  describe('hierarchical urls', () => {
    it('will replace parameters in endpoint according to idParam when object', async () => {
      const id = { parentId: '123', id: 'abc' };
      // eslint-disable-next-line
      const service = new DomainBaseService<any, {parentId: string, id: string}>(http as never, API_URL_SUFFIX, CONTROLLER);
      service.baseUrl = 'http://MyAPI/parent/{parentId}/child';
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith('http://MyAPI/parent/123/child/abc', { globalHandler: true });
    });
    it('will replace parameters in endpoint according to idParam when simple string', async () => {
      const id = 'abc';
      // eslint-disable-next-line
      const service = new DomainBaseService<any, uuid>(http as never, API_URL_SUFFIX, CONTROLLER);
      service.baseUrl = 'http://MyAPI/entity';
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith('http://MyAPI/entity/abc', { globalHandler: true });
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
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith(`search/${CONTROLLER}`, { params, isOData: true });
    });
  });
});
