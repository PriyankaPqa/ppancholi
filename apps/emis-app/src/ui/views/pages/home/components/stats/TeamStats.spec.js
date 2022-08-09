import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import {
  mockCombinedTeams, mockTeamEvents, mockTeamsDataStandard, mockTeamsMetadataStandard,
} from '@libs/entities-lib/team';
import { mockCombinedEvent } from '@libs/entities-lib/event';
import Component from './TeamStats.vue';

const storage = mockStorage();

const localVue = createLocalVue();
const mockEvent = mockCombinedEvent();

describe('TeamStats.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      data() {
        return { event: mockEvent };
      },
    });
  });

  describe('Template', () => {
    describe('Event selector', () => {
      let eventSelector;
      beforeEach(() => {
        eventSelector = wrapper.findDataTest('team_stats_select_event');
      });

      it('renders', () => {
        expect(eventSelector.exists()).toBeTruthy();
      });
    });

    describe('Team selector', () => {
      let teamSelector;
      beforeEach(() => {
        teamSelector = wrapper.findDataTest('team_stats_select_team');
      });

      it('renders', () => {
        expect(teamSelector.exists()).toBeTruthy();
      });
    });

    describe('Team stats', () => {
      let teamStatsSection;
      beforeEach(() => {
        teamStatsSection = wrapper.findDataTest('team_stats_count');
      });

      it('should not render team stats', () => {
        expect(teamStatsSection.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('eventHasBeenSelected', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          data() {
            return { selectedEventId: '' };
          },
        });
      });
      it('returns true if event has been selected', () => {
        expect(wrapper.vm.eventHasBeenSelected).toEqual(true);
      });
      it('returns false if event has not been selected', async () => {
        await wrapper.setData({ selectedEventId: null });
        expect(wrapper.vm.eventHasBeenSelected).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('selectEvent', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          data() {
            return { selectedEventId: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9' };
          },
        });
      });
      it('should set stats loaded to false', () => {
        wrapper.vm.selectEvent(mockEvent);
        expect(wrapper.vm.statsLoaded).toBe(false);
      });

      it('should call selectEvent and check for default stats value and call searchteam and filter team based on event id', () => {
        wrapper.vm.selectEvent(mockEvent);
        expect(wrapper.vm.teamStats).toStrictEqual({
          countClose: 0, countOpen: 0, countTeamMembers: 0, countTotal: 0,
        });
        expect(storage.team.actions.search).toHaveBeenCalledWith({
          filter: { Metadata: { Events: { any: { Id: wrapper.vm.selectedEventId } } } },
          orderBy: 'Entity/Name asc',
        });
      });

      it('should filter team based on event id', async () => {
        const eventId = mockTeamEvents()[0].id;
        await wrapper.setData({ selectedEventId: eventId });
        await wrapper.vm.selectEvent({ entity: { id: eventId } });
        expect(wrapper.vm.statTeam).toEqual(mockCombinedTeams());
      });

      it('should not search team if no event selected', async () => {
        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent();

        expect(storage.team.actions.search).toHaveBeenCalledTimes(0);
      });

      it('should clear team information if no event selected', async () => {
        wrapper.vm.selectedTeam = { entity: [], metadata: {} };
        wrapper.vm.teamStats = {
          countTeamMembers: 1,
          countClose: 2,
        };

        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent();

        expect(wrapper.vm.selectedTeam).toBe(null);
        expect(wrapper.vm.teamStats).toBe(null);
      });
    });

    describe('selectTeam', () => {
      let selectedTeam;
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              selectedEventId: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
              statTeam: mockCombinedTeams(),
            };
          },
        });
        selectedTeam = { ...mockCombinedTeams()[0] };
      });
      it('Should set stat loaded to true', () => {
        wrapper.vm.selectTeam(selectedTeam);
        expect(wrapper.vm.statsLoaded).toBe(false);
      });
      it('Should set stats as per users found', async () => {
        await wrapper.vm.selectTeam(selectedTeam);
        expect(wrapper.vm.teamStats).toEqual({
          countTotal: 2,
          countOpen: 1,
          countClose: 1,
          countTeamMembers: 1,
        });
      });
      it('Should set stats to default 0s if no users found', async () => {
        const statTeam = [{
          entity: mockTeamsDataStandard({ teamMembers: [] }),
          metadata: mockTeamsMetadataStandard(),
        }];
        wrapper.setData({ statTeam });
        await wrapper.vm.selectTeam(selectedTeam);
        expect(wrapper.vm.teamStats).toEqual({
          countTotal: 0,
          countOpen: 0,
          countClose: 0,
          countTeamMembers: 0,
        });
      });

      it('should not call getCaseFileAssignedCounts event if no team selected', async () => {
        wrapper.vm.$services.caseFiles.getCaseFileAssignedCounts = jest.fn();

        await wrapper.vm.selectTeam(null);

        expect(wrapper.vm.$services.caseFiles.getCaseFileAssignedCounts).toHaveBeenCalledTimes(0);
      });

      it('should clear team information if no team selected', async () => {
        wrapper.vm.teamStats = {
          countTeamMembers: 1,
          countClose: 2,
        };

        wrapper.vm.$services.caseFiles.getCaseFileAssignedCounts = jest.fn();

        await wrapper.vm.selectTeam(null);

        expect(wrapper.vm.teamStats).toBe(null);
      });
    });
  });
});
