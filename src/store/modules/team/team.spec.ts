import { Store } from 'vuex';
import {
  Team, mockTeamSearchDataAggregate, mockTeamsData, mockTeamMembersData,
} from '@/entities/team';
import {
 mockEventsData
} from '@/entities/event';
import { mockStore, IRootState } from '@/store';
import _cloneDeep from 'lodash/cloneDeep';

jest.mock('@/store/modules/team/teamUtils');

describe('>>> Team Module', () => {
  let store: Store<IRootState>;

  const mutations = {
    setTeam: jest.fn(),
  };

  beforeEach(() => {
    store = mockStore({
      modules: {
        team: {
          mutations,
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('team', () => {
      it('returns a deep clone of the team', () => {
        expect(store.getters['team/team']).toEqual(_cloneDeep(store.state.team.team));
      });
    });
  });

  describe('>> Actions', () => {
    describe('getTeam', () => {
      it('calls the service searchTeams with the right params', async () => {
        const { id } = mockTeamsData()[0];

        await store.dispatch('team/getTeam', id);

        expect(store.$services.teams.searchTeams).toHaveBeenCalledWith({ filter: { TeamId: id } });
      });

      it('calls mutation setTeam with the result of the search', async () => {
        const { id } = mockTeamsData()[0];

        await store.dispatch('team/getTeam', id);

        const expected = mockTeamSearchDataAggregate()[0];

        expect(mutations.setTeam).toHaveBeenCalledWith(expect.anything(), expected);
      });
    });

    describe('getTeamsAssignable', () => {
      it('calls the service getTeamsAssignable with the right params', async () => {
        const { id } = mockEventsData()[0];

        await store.dispatch('team/getTeamsAssignable', id);

        expect(store.$services.teams.getTeamsAssignable).toHaveBeenCalledWith(id);
      });
    });

    describe('createTeam', () => {
      it('calls the service createTeam with the right params', async () => {
        const payload = new Team(mockTeamSearchDataAggregate()[0]);
        expect(store.$services.teams.createTeam).toHaveBeenCalledTimes(0);

        await store.dispatch('team/createTeam', payload);

        expect(store.$services.teams.createTeam).toHaveBeenCalledWith(payload);
      });

      it('calls mutation setTeam with result of buildTeamSearchDataPayload', async () => {
        const payload = new Team(mockTeamSearchDataAggregate()[0]);
        await store.dispatch('team/createTeam', payload);

        expect(mutations.setTeam).toHaveBeenCalledWith(expect.anything(), mockTeamSearchDataAggregate()[0]);
      });
    });

    describe('editTeam', () => {
      it('calls the service editTeam with the right params', async () => {
        const payload = new Team(mockTeamSearchDataAggregate()[0]);
        expect(store.$services.teams.editTeam).toHaveBeenCalledTimes(0);

        await store.dispatch('team/editTeam', payload);

        expect(store.$services.teams.editTeam).toHaveBeenCalledWith(payload);
      });

      it('calls mutation setTeam with result of buildTeamSearchDataPayload', async () => {
        const payload = new Team(mockTeamSearchDataAggregate()[0]);
        await store.dispatch('team/editTeam', payload);

        expect(mutations.setTeam).toHaveBeenCalledWith(expect.anything(), mockTeamSearchDataAggregate()[0]);
      });
    });

    describe('searchTeams', () => {
      it('calls the searchTeams service', async () => {
        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(0);

        await store.dispatch('team/searchTeams');

        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(1);
      });
    });

    describe('searchAggregatedTeams', () => {
      it('calls the searchTeams service', async () => {
        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(0);

        await store.dispatch('team/searchAggregatedTeams');

        expect(store.$services.teams.searchTeams).toHaveBeenCalledTimes(1);
      });

      it('returns a list of aggregated teams', async () => {
        const params = { filter: { TeamId: 'mockId' } };
        const res = await store.dispatch('team/searchAggregatedTeams', params);

        expect(res).toEqual([new Team(mockTeamSearchDataAggregate()[0]), new Team(mockTeamSearchDataAggregate()[0])]);
      });
    });

    describe('addTeamMembers', () => {
      it('calls the addTeamMembers service', async () => {
        // We need to re-instantiate the team as a class since method are removed in test
        store.state.team.team = new Team();
        store.state.team.team.id = '1234';
        const payload = {
          teamMembers: mockTeamMembersData(),
        };
        await store.dispatch('team/addTeamMembers', payload);

        expect(store.$services.teams.addTeamMembers).toHaveBeenCalledWith('1234', payload.teamMembers);
      });
    });

    describe('removeTeamMember', () => {
      it('calls the removeTeamMember service', async () => {
        // We need to re-instantiate the team as a class since method are removed in test
        store.state.team.team = new Team();
        store.state.team.team.id = '1234';
        const payload = {
          teamMemberId: '456',
        };
        await store.dispatch('team/removeTeamMember', payload);

        expect(store.$services.teams.removeTeamMember).toHaveBeenCalledWith('1234', payload.teamMemberId);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setGetLoading', () => {
      it('sets getLoading', () => {
        expect(store.state.team.getLoading).toEqual(false);

        store.commit('team/setGetLoading', true);

        expect(store.state.team.getLoading).toEqual(true);
      });
    });

    describe('setSubmitLoading', () => {
      it('sets submitLoading', () => {
        expect(store.state.team.submitLoading).toEqual(false);

        store.commit('team/setSubmitLoading', true);

        expect(store.state.team.submitLoading).toEqual(true);
      });
    });

    describe('setSearchLoading', () => {
      it('sets submitLoading', () => {
        expect(store.state.team.searchLoading).toEqual(false);

        store.commit('team/setSearchLoading', true);

        expect(store.state.team.searchLoading).toEqual(true);
      });
    });

    describe('setRemoveLoading', () => {
      it('sets submitLoading', () => {
        expect(store.state.team.removeLoading).toEqual(false);

        store.commit('team/setRemoveLoading', true);

        expect(store.state.team.removeLoading).toEqual(true);
      });
    });

    describe('setTeam', () => {
      it('sets team with a new instance of team', () => {
        store = mockStore();
        store.state.team.team = null;
        store.commit('team/setTeam', mockTeamSearchDataAggregate()[0]);

        expect(store.state.team.team).toEqual(new Team(mockTeamSearchDataAggregate()[0]));
      });
    });

    describe('setCachedTeams', () => {
      it('sets cachedTeams with raw data from search team', () => {
        expect(store.state.team.cachedTeams).toEqual([]);

        store.commit('team/setCachedTeams', [{ id: 'id' }]);

        expect(store.state.team.cachedTeams).toEqual([{ id: 'id' }]);
      });
    });

    describe('resetTeam', () => {
      it('reset team with a new instance of team', () => {
        store = mockStore();
        store.commit('team/setTeam', mockTeamSearchDataAggregate()[0]);
        store.commit('team/resetTeam');

        expect(store.state.team.team).toEqual(new Team());
      });
    });

    describe('removeTeamMember', () => {
      it('should call removeTeamMember method from team entity with correct id', () => {
        store.state.team.team = new Team();
        jest.spyOn(store.state.team.team, 'removeTeamMember');
        store.commit('team/removeTeamMember', 'guid');
        expect(store.state.team.team.removeTeamMember).toHaveBeenCalledWith('guid');
      });
    });

    describe('addTeamMembers', () => {
      it('should call addTeamMembers method from team entity with proper parameters', () => {
        store.state.team.team = new Team();
        jest.spyOn(store.state.team.team, 'addTeamMembers');
        store.commit('team/addTeamMembers', mockTeamMembersData());
        expect(store.state.team.team.addTeamMembers).toHaveBeenCalledWith(mockTeamMembersData());
      });
    });
  });
});
