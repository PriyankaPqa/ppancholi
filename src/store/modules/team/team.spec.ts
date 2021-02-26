import { mockStore } from '@/store';
import { ITeamData, Team } from '@/entities/team';

describe('>>> Team Module', () => {
  const store = mockStore();

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
  });
});
