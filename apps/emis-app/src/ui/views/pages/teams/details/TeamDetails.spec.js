import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import {
  mockTeamEntity, mockTeamsDataAddHoc, mockTeamsDataStandard,
} from '@libs/entities-lib/team';
import { RcPageContent, RcTabs } from '@libs/component-lib/components';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import { useMockEventStore } from '@/pinia/event/event.mock';
import Component, { SelectedTab } from './TeamDetails.vue';

const localVue = createLocalVue();
const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);
const eventStore = useMockEventStore(pinia).eventStore;

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

      },
      stubs: ['v-select-a11y'],
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
      });

      test('Team type', () => {
        expect(wrapper.findDataTest('team_type').text()).toBe('enums.TeamType.Standard');
      });

      test('Team Member Count', () => {
        expect(wrapper.findDataTest('team_members_count').text()).toBe('1');
      });

      test('Primary Contact', () => {
        expect(wrapper.findDataTest('team_primary_contact').text()).toBe('Jane Smith');
      });

      test('Team events', () => {
        expect(wrapper.findDataTest('team_events').text()).toBe('Gatineau Floods 2021, Vegas Earthquake 2021');
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

    describe('team-title-escalation', () => {
      it('should be rendered if displayEscalationLabel is true', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayEscalationLabel: () => true,
          },
        });
        const element = wrapper.findDataTest('team-title-escalation');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered if displayEscalationLabel is false', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayEscalationLabel: () => false,
          },
        });
        const element = wrapper.findDataTest('team-title-escalation');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('team_escalation', () => {
      it('should be rendered if displayEscalationLabel is true', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayEscalationLabel: () => true,
          },
        });
        const element = wrapper.findDataTest('team_escalation');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered if displayEscalationLabel is false', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayEscalationLabel: () => false,
          },
        });
        const element = wrapper.findDataTest('team_escalation');
        expect(element.exists()).toBeFalsy();
      });

      it('should not be rendered if feature flag for appointments is on', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            displayEscalationLabel: () => true,
          },
        });
        const element = wrapper.findDataTest('team_escalation');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('team_lodging', () => {
      it('should be rendered if displayUseLodging is true', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayUseLodging: () => true,
          },
        });
        const element = wrapper.findDataTest('team_lodging');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered if displayUseLodging is false', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayUseLodging: () => false,
          },
        });
        const element = wrapper.findDataTest('team_lodging');
        expect(element.exists()).toBeFalsy();
      });

      it('should not be rendered if feature flag for appointments is on', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            displayUseLodging: () => true,
          },
        });
        const element = wrapper.findDataTest('team_lodging');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('Label for all set properties', () => {
      it('should be rendered if displayAllSetAs is true', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayAllSetAs: () => true,
          },
        });
        const element = wrapper.findDataTest('team_all_sets');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered if displayAllSetAs is false', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayAllSetAs: () => false,
          },
        });
        const element = wrapper.findDataTest('team_all_sets');
        expect(element.exists()).toBeFalsy();
      });

      it('should contain the labelForSetAs', async () => {
        await mountWrapper(false, 5, {
          computed: {
            displayAllSetAs: () => true,
            labelForSetAs: () => 'Lodging, Escalation',
          },
        });
        const element = wrapper.findDataTest('team_all_sets_label');
        expect(element.text()).toContain('Lodging, Escalation');
      });
    });

    describe('tabs and assign service options', () => {
      it('renders tabs if feature flag is on and team is usable for appointments', async () => {
        teamStore.getById = jest.fn(() => mockTeamEntity({ useForAppointments: true }));
        await mountWrapper(true, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
        });
        const tabs2 = wrapper.findComponent(RcTabs);
        expect(tabs2.exists()).toBeTruthy();
        await wrapper.setData({ selectedTab: SelectedTab.AssignServiceOptions });
        const table = wrapper.findDataTest('assign-service-options-table');
        expect(table.exists()).toBeTruthy();
        await wrapper.setData({ selectedTab: SelectedTab.TeamMembers });
        const table2 = wrapper.findDataTest('assign-service-options-table');
        expect(table2.exists()).toBeFalsy();
      });

      it('does not render tabs if team is not  usable for appointments', async () => {
        teamStore.getById = jest.fn(() => mockTeamEntity({ useForAppointments: false }));
        await mountWrapper(true, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
        });
        const tabs2 = wrapper.findComponent(RcTabs);
        expect(tabs2.exists()).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false, 5, {
        computed: {
          team: () => mockTeamEntity(),
        },
      });
    });

    describe('loadTeam', () => {
      it('should calls getTeam actions and the events', async () => {
        await wrapper.vm.loadTeam();
        expect(teamStore.fetch).toHaveBeenLastCalledWith('id');
        expect(eventStore.fetchByIds).toHaveBeenCalledWith(['id-1'], true);
      });

      it('should fetch userAccount metadata with correct Id', async () => {
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('guid-member-1', 'Disabled');
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

    describe('getEventNames', () => {
      it('should call the store and return the names', () => {
        const res = wrapper.vm.getEventNames({ eventIds: ['abc'] });
        expect(res).toBe('Gatineau Floods 2021, Vegas Earthquake 2021');
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

    describe('displayEscalationLabel', () => {
      it('should be true if has feature flag TaskManagement and teamType is Ad Hoc and isEscalation is true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.TaskManagement],
          computed: {
            team: () => mockTeamsDataAddHoc({ isEscalation: true }),
          },
        });
        expect(wrapper.vm.displayEscalationLabel).toBeTruthy();
      });

      it('should be false if has no feature flag TaskManagement', async () => {
        await mountWrapper(false, 5, {
          featureList: [],
          computed: {
            team: () => mockTeamsDataAddHoc(),
          },
        });
        expect(wrapper.vm.displayEscalationLabel).toBeFalsy();
      });

      it('should be false if has feature flag TaskManagement and teamType is Ad Hoc but isEscalation is false', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.TaskManagement],
          computed: {
            team: () => mockTeamsDataAddHoc({ isEscalation: false }),
          },
        });
        expect(wrapper.vm.displayEscalationLabel).toBeFalsy();
      });

      it('should be false if has feature flag TaskManagement but teamType is standard', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.TaskManagement],
          computed: {
            team: () => mockTeamsDataStandard(),
          },
        });
        expect(wrapper.vm.displayEscalationLabel).toBeFalsy();
      });
    });

    describe('displayUseLodging', () => {
      it('should be true if has feature flag Lodging and useForLodging is true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.Lodging],
          computed: {
            team: () => mockTeamsDataAddHoc({ useForLodging: true }),
          },
        });
        expect(wrapper.vm.displayUseLodging).toBeTruthy();
      });

      it('should be false if has no feature flag Lodging', async () => {
        await mountWrapper(false, 5, {
          featureList: [],
          computed: {
            team: () => mockTeamsDataAddHoc({ useForLodging: true }),
          },
        });
        expect(wrapper.vm.displayUseLodging).toBeFalsy();
      });

      it('should be false if useForLodging is false', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.TaskManagement],
          computed: {
            team: () => mockTeamsDataAddHoc({ useForLodging: false }),
          },
        });
        expect(wrapper.vm.displayUseLodging).toBeFalsy();
      });
    });

    describe('displayAllSetAs', () => {
      it('should be true if has feature flag AppointmentBooking and useForAppointments is true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: true }),
          },
        });
        expect(wrapper.vm.displayAllSetAs).toBeTruthy();
      });

      it('should be true if has feature flag AppointmentBooking and displayUseLodging is true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            displayUseLodging: () => true,
          },
        });
        expect(wrapper.vm.displayAllSetAs).toBeTruthy();
      });
      it('should be true if has feature flag AppointmentBooking and displayEscalationLabel is true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            displayEscalationLabel: () => true,
          },
        });
        expect(wrapper.vm.displayAllSetAs).toBeTruthy();
      });

      it('should be false if has feature flag AppointmentBooking off ', async () => {
        await mountWrapper(false, 5, {
          featureList: [],
          computed: {
            displayEscalationLabel: () => true,
          },
        });
        expect(wrapper.vm.displayAllSetAs).toBeFalsy();
      });
      it('should be false if has feature flag AppointmentBooking on and none of the properties are true', async () => {
        await mountWrapper(false, 5, {
          featureList: [wrapper.vm.$featureKeys.AppointmentBooking],
          computed: {
            displayEscalationLabel: () => false,
            displayUseLodging: () => false,
            team: () => mockTeamsDataAddHoc({ useForAppointments: false }),
          },
        });
        expect(wrapper.vm.displayAllSetAs).toBeFalsy();
      });
    });

    describe('labelForSetAs', () => {
      it('should return the corect label for each property', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: true }),
            displayEscalationLabel: () => false,
            displayUseLodging: () => false,
          },
        });
        expect(wrapper.vm.labelForSetAs).toEqual('teams.appointments');

        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: true }),
            displayEscalationLabel: () => true,
            displayUseLodging: () => false,
          },
        });
        expect(wrapper.vm.labelForSetAs).toEqual('teams.escalation, teams.appointments');

        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: true }),
            displayEscalationLabel: () => true,
            displayUseLodging: () => true,
          },
        });
        expect(wrapper.vm.labelForSetAs).toEqual('teams.lodging, teams.escalation, teams.appointments');

        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: false }),
            displayEscalationLabel: () => true,
            displayUseLodging: () => true,
          },
        });
        expect(wrapper.vm.labelForSetAs).toEqual('teams.lodging, teams.escalation');

        await mountWrapper(false, 5, {
          computed: {
            team: () => mockTeamsDataAddHoc({ useForAppointments: false }),
            displayEscalationLabel: () => false,
            displayUseLodging: () => true,
          },
        });
        expect(wrapper.vm.labelForSetAs).toEqual('teams.lodging');
      });
    });
  });
});
