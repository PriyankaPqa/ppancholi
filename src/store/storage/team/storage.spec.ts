import { Team } from '@/entities/team';
import { mockStore } from '@/store';

import { mockAppUserData } from '@/entities/app-user';
import { mockTeamSearchData } from '../../../entities/team/team.mock';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> Team Storage', () => {
  describe('>> Actions', () => {
    it('should proxy getTeam,', () => {
      const { id } = new Team(mockTeamSearchData()[0]);
      storage.actions.getTeam(id);
      expect(store.dispatch).toBeCalledWith('team/getTeam', id);
    });

    it('should proxy createTeam,', () => {
      const payload = new Team(mockTeamSearchData()[0]);
      storage.actions.createTeam(payload);
      expect(store.dispatch).toBeCalledWith('team/createTeam', payload);
    });

    it('should proxy editTeam,', () => {
      const payload = new Team(mockTeamSearchData()[0]);
      storage.actions.editTeam(payload);
      expect(store.dispatch).toBeCalledWith('team/editTeam', payload);
    });

    it('should proxy searchTeams', () => {
      storage.actions.searchTeams({});
      expect(store.dispatch).toBeCalledWith('team/searchTeams', {});
    });

    it('should proxy addTeamMembers', () => {
      const payload = {
        teamMembers: mockAppUserData(),
      };
      storage.actions.addTeamMembers(payload.teamMembers);
      expect(store.dispatch).toBeCalledWith('team/addTeamMembers', payload);
    });

    it('should proxy removeTeamMember', () => {
      const payload = {
        teamMemberId: '5678',
      };
      storage.actions.removeTeamMember(payload.teamMemberId);
      expect(store.dispatch).toBeCalledWith('team/removeTeamMember', payload);
    });
  });
});
