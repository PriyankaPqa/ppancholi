import { mockTeamsData, Team } from '@/entities/team';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { TeamsService } from './teams';

const http = mockHttp();

describe('>>> Teams Service', () => {
  const service = new TeamsService(http as never);

  test('createTeam is linked to the correct URL and params', async () => {
    const payload = new Team(mockTeamsData()[0]);
    await service.createTeam(payload);
    expect(http.post).toHaveBeenCalledWith('/team/teams', payload, { globalHandler: false });
  });

  test('searchTeams is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchTeams(params);
    expect(http.get).toHaveBeenCalledWith('/search/teams', { params, isOData: true });
  });
});
