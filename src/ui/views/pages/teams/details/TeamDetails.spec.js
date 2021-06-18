import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockTeam, mockTeamSearchDataAggregate, Team } from '@/entities/team';

import { RcPageContent } from '@crctech/component-library';
import { mockUserStateLevel } from '@/test/helpers';
import Component from './TeamDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();

jest.mock('@/store/modules/team/teamUtils');

describe('TeamDetails.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        id: 'id',
      },
      computed: {
        team() {
          return mockTeam();
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Edit button', () => {
      it('should be enabled for L4+', () => {
        wrapper = shallowMount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(4),
          },
          propsData: {
            id: 'id',
          },
          computed: {
            team() {
              return mockTeam();
            },
          },
        });
        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeTruthy();
      });
      it('should be hidden for L3', () => {
        wrapper = shallowMount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(3),
          },
          propsData: {
            id: 'id',
          },
          computed: {
            team() {
              return mockTeam();
            },
          },
        });
        const props = wrapper.findComponent(RcPageContent).props('showEditButton');
        expect(props).toBeFalsy();
      });
    });

    describe('Elements', () => {
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
  });

  describe('Methods', () => {
    describe('loadTeam', () => {
      it('should calls getTeam actions', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.$storage.team.actions.getTeam).toHaveBeenLastCalledWith('id');
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
        const { events } = mockTeam();
        const res = wrapper.vm.buildEventsString(events);
        expect(res).toBe('Event 1, Event 2');
      });
    });
  });

  describe('Computed', () => {
    describe('isLoading', () => {
      it('should be linked to getLoading state', () => {
        wrapper.vm.$store.state.team.getLoading = true;
        expect(wrapper.vm.isLoading).toEqual(true);
      });
    });

    describe('team', () => {
      it('should be linked to team getters team', () => {
        const mockTeam = mockTeamSearchDataAggregate()[1];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'id',
          },
          mocks: {
            $storage: {
              team: {
                getters: {
                  team: () => new Team(mockTeam),
                },
              },
            },
          },
        });

        expect(wrapper.vm.team).toEqual(new Team(mockTeam));
      });
    });
  });
});
