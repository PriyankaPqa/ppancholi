import { mockTeamsData, Team } from '@/entities/team';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { TeamsService } from './teams';

const http = mockHttp();

describe('>>> Teams Service', () => {
  const service = new TeamsService(http as never);

  test('getTeam is linked to the correct URL', async () => {
    await service.getTeam('1234');
    expect(http.get).toHaveBeenCalledWith('/team/teams/1234');
  });

  test('createTeam is linked to the correct URL and params', async () => {
    const payload = new Team(mockTeamsData()[0]);
    await service.createTeam(payload);
    const expectedPayload = {
      name: payload.name,
      eventIds: payload.events.map((e) => e.id),
      teamMembers: payload.teamMembers,
      teamType: payload.teamType,
    };
    expect(http.post).toHaveBeenCalledWith('/team/teams', expectedPayload, { globalHandler: false });
  });

  test('editTeam calls the correct URL and payload', async () => {
    const payload = new Team(mockTeamsData()[0]);
    await service.editTeam(payload);

    const expectedPayload = {
      name: payload.name,
      eventIds: payload.events.map((e) => e.id),
      primaryContact: payload.teamMembers.find((m) => m.isPrimaryContact),
      status: payload.status,
    };

    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${mockTeamsData()[0].id}`, expectedPayload, { globalHandler: false });
  });

  test('searchTeams is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchTeams(params);
    expect(http.get).toHaveBeenCalledWith('/search/team-projections', { params, isOData: true });
  });
});
