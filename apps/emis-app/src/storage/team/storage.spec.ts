import { TEAM_ENTITIES, TEAM_METADATA } from '@/constants/vuex-modules';
import { mockEventEntityData } from '@libs/entities-lib/event';
import { mockStore } from '@/store';
import { mockTeamMembersData, mockTeamEntity } from '@libs/entities-lib/team/team.mock';
import { TeamStorage } from './storage';

const entityModuleName = TEAM_ENTITIES;
const metadataModuleName = TEAM_METADATA;

const store = mockStore({}, { commit: true, dispatch: true });

const storage = new TeamStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Team Storage', () => {
  describe('>> Actions', () => {
    it('should proxy getTeamsAssignable,', () => {
      const { id } = mockEventEntityData()[0];
      storage.actions.getTeamsAssignable(id);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/getTeamsAssignable`, id);
    });

    it('should proxy getTeamsAssigned', () => {
      storage.actions.getTeamsAssigned('test-id');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/getTeamsAssigned`, 'test-id');
    });

    it('should proxy createTeam,', () => {
      const payload = mockTeamEntity();
      storage.actions.createTeam(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createTeam`, payload);
    });

    it('should proxy editTeam,', () => {
      const payload = mockTeamEntity();
      storage.actions.editTeam(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editTeam`, payload);
    });

    it('should proxy addTeamMembers', () => {
      const payload = {
        teamId: 'abc',
        teamMembers: mockTeamMembersData(),
      };
      storage.actions.addTeamMembers('abc', payload.teamMembers);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/addTeamMembers`, payload);
    });

    it('should proxy removeTeamMember', () => {
      const payload = {
        teamId: 'abc',
        teamMemberId: '5678',
      };
      storage.actions.removeTeamMember('abc', payload.teamMemberId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/removeTeamMember`, payload);
    });

    it('should proxy emptyTeam', () => {
      const payload = {
        teamId: 'abc',
      };
      storage.actions.emptyTeam('abc');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/emptyTeam`, payload);
    });
  });
});
