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
});
