import {
  TeamEntity, mockTeamMembersData, mockTeamEntity,
} from '@libs/entities-lib/team';
import { mockHttp } from '../../http-client';
import { TeamsService } from './teams';

const http = mockHttp();

describe('>>> Teams Service', () => {
  const service = new TeamsService(http as never);

  test('getTeamsAssignable is linked to the correct URL', async () => {
    await service.getTeamsAssignable('1234');
    expect(http.get).toHaveBeenCalledWith('/team/teams/events/1234/assignable');
  });

  test('getTeamsAssigned is linked to the correct URL', async () => {
    await service.getTeamsAssigned('1234');
    expect(http.get).toHaveBeenCalledWith('/team/teams/case-files/1234/assigned');
  });

  test('createTeam is linked to the correct URL and params', async () => {
    const payload = new TeamEntity(mockTeamEntity());
    await service.createTeam(payload);
    expect(http.post).toHaveBeenCalledWith('/team/teams', payload, { globalHandler: false });
  });

  test('editTeam calls the correct URL and payload', async () => {
    const payload = new TeamEntity(mockTeamEntity());
    payload.teamMembers.push({
      id: 'not primary',
      isPrimaryContact: false,
    });
    await service.editTeam(payload);

    const primaryContact = payload.teamMembers.find((m) => m.isPrimaryContact);

    const expectedPayload = {
      name: payload.name,
      eventIds: payload.eventIds,
      primaryContact,
      status: payload.status,
    };

    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${payload.id}`, expectedPayload, { globalHandler: false });
  });

  test('addTeamMembers is linked to the correct URL and params', async () => {
    const params = {
      teamId: '1234',
      teamMembers: mockTeamMembersData(),
    };
    const payload = {
      teamMemberIds: params.teamMembers.map((t) => t.id),
    };

    await service.addTeamMembers(params.teamId, params.teamMembers);
    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${params.teamId}/add-team-members`, payload);
  });

  test('removeTeamMember is linked to the correct URL', async () => {
    const teamId = '123';
    const teamMemberId = '456';
    await service.removeTeamMember(teamId, teamMemberId);
    expect(http.delete).toHaveBeenCalledWith(`/team/teams/${teamId}/member/${teamMemberId}`);
  });

  test('emptyTeam is linked to the correct URL', async () => {
    const teamId = '123';
    await service.emptyTeam(teamId);
    expect(http.patch).toHaveBeenCalledWith(`/team/teams/${teamId}/empty-team`);
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`team/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('team/search/teams', { params, isOData: true });
    });
  });
});
