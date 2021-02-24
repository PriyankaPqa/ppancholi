import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { TeamsService } from './teams';

const http = mockHttp();

describe('>>> Teams Service', () => {
  const service = new TeamsService(http as never);

  test('searchTeams is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchTeams(params);
    expect(http.get).toHaveBeenCalledWith('/search/teams', { params, isOData: true });
  });
});
