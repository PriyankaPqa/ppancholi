/**
 * @group ui/components/home
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import {
  mockCombinedTeams, mockTeamEvents, mockTeamsDataStandard, mockTeamsMetadataStandard,
} from '@/entities/team';
import { EEventStatus, mockCombinedEvent } from '@/entities/event';
import Component from './TeamStats.vue';

const storage = mockStorage();

const localVue = createLocalVue();
const mockEvent = mockCombinedEvent();

describe('TeamStats.vue', () => {
  let wrapper;

  beforeEach(async () => {
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
    describe('fetchActiveEvents', () => {
      it('should fetch the proper events', () => {
        wrapper.vm.fetchActiveEvents();
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Entity: { Schedule: { Status: EEventStatus.Open } } },
          top: 999,
        });
      });
    });

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
        expect(storage.team.actions.search).toHaveBeenCalled();
      });

      it('should filter team based on event id', async () => {
        await wrapper.setData({ selectedEventId: mockTeamEvents()[0].id });
        await wrapper.vm.selectEvent();
        expect(wrapper.vm.statTeam).toEqual(mockCombinedTeams());
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
    });
  });
});
