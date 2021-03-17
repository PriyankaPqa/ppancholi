import { Store } from 'vuex';
import { mockTeamsData, Team } from '@/entities/team';
import { mockStore, IRootState } from '@/store';
import { mockAppUserData } from '@/entities/app-user';

describe('>>> Team Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({
      modules: {
        event: {
          state: {
            loading: false,
          },
        },
      },
    });
  });

  describe('>> Actions', () => {
    describe('getTeam', () => {
      it('calls the service searchTeams with the right params', async () => {
        const store = mockStore();
        const { id } = mockTeamsData()[0];

        await store.dispatch('team/getTeam', id);

        expect(store.$services.teams.searchTeams).toHaveBeenCalledWith({ filter: { TeamId: id } });
      });
    });

    describe('createTeam', () => {
      it('calls the service createTeam with the right params', async () => {
        const store = mockStore();
        const payload = new Team(mockTeamsData()[0]);
        expect(store.$services.teams.createTeam).toHaveBeenCalledTimes(0);

        await store.dispatch('team/createTeam', payload);

        expect(store.$services.teams.createTeam).toHaveBeenCalledWith(payload);
      });
    });

    describe('editTeam', () => {
      it('calls the service editTeam with the right params', async () => {
        const store = mockStore();
        const payload = new Team(mockTeamsData()[0]);
        expect(store.$services.teams.editTeam).toHaveBeenCalledTimes(0);

        await store.dispatch('team/editTeam', payload);

        expect(store.$services.teams.editTeam).toHaveBeenCalledWith(payload);
      });
    });

    describe('searchTeams', () => {
      it('calls the searchTeams service', async () => {
        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(0);

        await store.dispatch('team/searchTeams');

        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(1);
      });
    });

    describe('addTeamMembers', () => {
      it('calls the addTeamMembers service', async () => {
        const store = mockStore();
        const payload = {
          teamId: '1234',
          teamMembers: mockAppUserData(),
        };
        await store.dispatch('team/addTeamMembers', payload);

        expect(store.$services.teams.addTeamMembers).toHaveBeenCalledWith(payload.teamId, payload.teamMembers);
      });
    });
  });
});
