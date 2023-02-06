import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/storage';
import {
  mockTeamEntity, mockTeamEvents, mockTeamsMetadataStandard,
} from '@libs/entities-lib/team';
import { RcPageContent } from '@libs/component-lib/components';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import Component from './TeamDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { teamStore, teamMetadataStore } = useMockTeamStore(pinia);

describe('TeamDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'id',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper(false);
    });
    describe('Edit button', () => {
      it('should be enabled for L4+', async () => {
        await mountWrapper(false, 4);

        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeTruthy();
      });
      it('should be hidden for L3', async () => {
        await mountWrapper(false, 3);
        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeFalsy();
      });
    });

    describe('Elements', () => {
      beforeEach(async () => {
        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamEntity(),
          },
        });
        teamStore.getById = jest.fn(() => mockTeamEntity());
        teamMetadataStore.getById = jest.fn(() => mockTeamsMetadataStandard());
      });

      test('Team type', () => {
        expect(wrapper.findDataTest('team_type').text()).toBe('Standard');
      });

      test('Team Member Count', () => {
        expect(wrapper.findDataTest('team_members_count').text()).toBe('1');
      });

      test('Primary Contact', () => {
        expect(wrapper.findDataTest('team_primary_contact').text()).toBe('Jane Smith');
      });

      test('Team events', () => {
        expect(wrapper.findDataTest('team_events').text()).toBe('Event 1, Event 2');
      });
    });

    describe('TeamMembersTable', () => {
      it('should pass teamId as Prosp to TeamMembersTable', async () => {
        await mountWrapper(
          false,
          5,
          {
            computed: {
              teamId: () => 'mock-team-id-1',
            },
          },
        );
        const component = wrapper.findComponent(TeamMembersTable);
        const props = 'teamId';
        expect(component.props(props)).toEqual('mock-team-id-1');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false, 5, {
        computed: {
          team: () => mockTeamEntity(),
          teamMetadata: () => mockTeamsMetadataStandard(),
        },
      });
    });

    describe('loadTeam', () => {
      it('should calls getTeam actions', async () => {
        await wrapper.vm.loadTeam();
        expect(teamStore.fetch).toHaveBeenLastCalledWith('id');
        expect(teamMetadataStore.fetch).toHaveBeenLastCalledWith('id', false);
      });

      it('should fetch userAccount metadata with correct Id', async () => {
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('guid-member-1', false);
      });
    });

    describe('navigateToHome', () => {
      it('should redirect to team home page', async () => {
        await wrapper.vm.navigateToHome();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.home.name,
        });
      });
    });

    describe('navigateToEdit', () => {
      it('should redirect to edit team with proper params', async () => {
        await wrapper.vm.navigateToEdit();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name,
          params: { teamType: 'standard', id: 'id', from: wrapper.vm.$route.name },
        });
      });
    });

    describe('buildEventsString', () => {
      it('should generate empty string if array is empty', () => {
        const res = wrapper.vm.buildEventsString([]);
        expect(res).toBe('');
      });

      it('should generate the correct string', () => {
        const events = mockTeamEvents();
        const res = wrapper.vm.buildEventsString(events);
        expect(res).toBe('Event 1, Event 2');
      });
    });
  });

  describe('Computed', () => {
    describe('team', () => {
      it('should be linked to team getters team', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamEntity(),
          },
        });
        await wrapper.setProps({
          id: 'guid-team-1',
        });
        expect(wrapper.vm.team).toEqual(mockTeamEntity({ id: 'guid-team-1' }));
      });
    });

    describe('teamMetadata', () => {
      it('should be linked to team getters teamMetadata', async () => {
        await mountWrapper(false, 5, {
          computed: {
            teamMetadata: () => mockTeamsMetadataStandard(),
          },
        });
        await wrapper.setProps({
          id: 'guid-team-1',
        });
        expect(wrapper.vm.teamMetadata).toEqual(mockTeamsMetadataStandard({ id: 'guid-team-1' }));
      });
    });

    describe('teamId', () => {
      it('should return id from Teams Entity', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamEntity({ id: 'mock-team-1' }),
          },
        });
        expect(wrapper.vm.teamId).toEqual('mock-team-1');
      });

      it('should return id from route.id if Teams Entity isnt ready', async () => {
        await mountWrapper(
          false,
          5,
          {
            computed: {
              team: () => {},
            },
          },
        );
        wrapper.vm.$route = { params: { id: 'mock-team-2' } };
        expect(wrapper.vm.teamId).toEqual('mock-team-2');
      });
    });
  });
});
