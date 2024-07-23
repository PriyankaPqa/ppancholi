import { IQuery } from '@libs/entities-lib/src/reporting';
import { IHttpMock, mockHttp } from '../../http-client';
import { QueriesService } from './queries';

describe('>>> Queries Service', () => {
  let http: IHttpMock;
  let service: QueriesService;

  beforeEach(() => {
    http = mockHttp();
    service = new QueriesService(http as never);
    jest.clearAllMocks();
  });

  test('fetchByType is linked to the correct URL', async () => {
    await service.fetchByType(3);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/fetch-by-type/3`);
  });

  test('create is linked to the correct URL', async () => {
    await service.create({ id: 'some Id', name: 'some name' } as IQuery);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}`, { id: 'some Id', name: 'some name' });
  });

  test('edit is linked to the correct URL', async () => {
    await service.edit({ id: 'some Id', name: 'some name' } as IQuery);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/some Id`, { id: 'some Id', name: 'some name' });
  });

  test('fetchEnums is linked to the correct URL', async () => {
    await service.fetchEnums();
    expect(http.get).toHaveBeenCalledWith('www.test.com/common/data-providers/enums');
  });

  test('fetchListOptions is linked to the correct URL', async () => {
    await service.fetchListOptions();
    expect(http.get).toHaveBeenCalledWith('www.test.com/common/data-providers/list-options');
  });

  test('fetchPrograms is linked to the correct URL', async () => {
    await service.fetchPrograms();
    expect(http.get).toHaveBeenCalledWith('www.test.com/common/data-providers/program-names');
  });

  test('fetchEvents is linked to the correct URL', async () => {
    await service.fetchEvents();
    expect(http.get).toHaveBeenCalledWith('www.test.com/common/data-providers/event-names');
  });

  test('getPowerBiTokenForReport is linked to the correct URL', async () => {
    await service.getPowerBiTokenForReport('name');
    expect(http.get).toHaveBeenCalledWith('www.test.com/common/power-bi/embed-info/name');
  });
});
