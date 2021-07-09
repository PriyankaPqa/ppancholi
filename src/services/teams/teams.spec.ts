import {
  mockTeamSearchDataAggregate, Team, IAddTeamMembersRequest, mockTeamMembersData,
} from '@/entities/team';
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

  test('getTeamsAssignable is linked to the correct URL', async () => {
    await service.getTeamsAssignable('1234');
    expect(http.get).toHaveBeenCalledWith('/team/teams/events/1234/assignable');
  });

  test('createTeam is linked to the correct URL and params', async () => {
    const payload = new Team(mockTeamSearchDataAggregate()[0]);
    await service.createTeam(payload);
    const expectedPayload = {
      name: payload.name,
      eventIds: payload.events.map((e) => e.id),
      teamMembers: payload.teamMembers.map((m) => ({ id: m.id, isPrimaryContact: m.isPrimaryContact })),
      teamType: payload.teamType,
    };
    expect(http.post).toHaveBeenCalledWith('/team/teams', expectedPayload, { globalHandler: false });
  });

  test('editTeam calls the correct URL and payload', async () => {
    const payload = new Team(mockTeamSearchDataAggregate()[0]);
    await service.editTeam(payload);

    const primaryContact = payload.teamMembers.find((m) => m.isPrimaryContact);

    const expectedPayload = {
      name: payload.name,
      eventIds: payload.events.map((e) => e.id),
      primaryContact: {
        id: primaryContact.id,
        isPrimaryContact: true,
      },
      status: payload.status,
    };

    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${payload.id}`, expectedPayload, { globalHandler: false });
  });

  test('searchTeams is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchTeams(params);
    expect(http.get).toHaveBeenCalledWith('/search/team-projections', { params, isOData: true });
  });

  test('addTeamMembers is linked to the correct URL and params', async () => {
    const params = {
      teamId: '1234',
      teamMembers: mockTeamMembersData(),
    };
    const payload = {
      teamMemberIds: params.teamMembers.map((t) => t.id),
    } as IAddTeamMembersRequest;

    await service.addTeamMembers(params.teamId, params.teamMembers);
    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${params.teamId}/add-team-members`, payload);
  });

  test('removeTeamMember is linked to the correct URL', async () => {
    const teamId = '123';
    const teamMemberId = '456';
    await service.removeTeamMember(teamId, teamMemberId);
    expect(http.delete).toHaveBeenCalledWith(`/team/teams/${teamId}/member/${teamMemberId}`);
  });
});
