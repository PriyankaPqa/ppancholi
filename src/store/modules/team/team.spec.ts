import { Store } from 'vuex';
import { ITeamData, mockTeamsData, Team } from '@/entities/team';
import { mockStore, IRootState } from '@/store';

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

  describe('>> Getters', () => {
    describe('loading', () => {
      test('the loading getter returns a boolean', () => {
        expect(store.getters['team/loading']).toEqual(false);
      });
    });
  });

  // describe('>> Mutations', () => {

  // });

  describe('>> Actions', () => {
    describe('searchTeams', () => {
      it('calls the searchTeams service', async () => {
        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(0);

        await store.dispatch('team/searchTeams');

        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(1);
      });

      it('returns proper results and value are instance of team class', async () => {
        const res = await store.dispatch('team/searchTeams');

        expect(res).toEqual({
          ...res,
          value: res.value.map((el: ITeamData) => (new Team(el))),
        });
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
  });
});
