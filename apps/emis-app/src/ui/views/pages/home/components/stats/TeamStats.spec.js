import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockTeamEntities, mockTeamEvents, mockTeamsDataStandard,
} from '@libs/entities-lib/team';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockTeamStore } from '@/pinia/team/team.mock';

import { mockProvider } from '@/services/provider';
import Component from './TeamStats.vue';

const localVue = createLocalVue();
const services = mockProvider();
const mockEvent = mockEventEntity();
const { pinia, teamStore } = useMockTeamStore();

describe('TeamStats.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = mount(Component, {
      localVue,
      pinia,
      data() {
        return { event: mockEvent };
      },
      mocks: {
        $services: services,
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
          pinia,

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
        teamStore.search = jest.fn();
        wrapper.vm.selectEvent(mockEvent);
        expect(wrapper.vm.teamStats).toStrictEqual({
          countClose: 0, countOpen: 0, countTeamMembers: 0, countTotal: 0,
        });
        expect(teamStore.search).toHaveBeenCalledWith({ params: {
          filter: { Entity: { Events: { any: { Id: { value: wrapper.vm.selectedEventId, type: 'guid' } } } } },
          orderBy: 'Entity/Name asc',
        },
        includeInactiveItems: false,
        otherSearchEndpointParameters: { manageableTeamsOnly: true } });
      });

      it('should filter team based on event id', async () => {
        teamStore.search = jest.fn(() => mockTeamEntities());
        const eventId = mockTeamEvents()[0].id;
        await wrapper.setData({ selectedEventId: eventId });
        await wrapper.vm.selectEvent({ id: eventId });
        expect(wrapper.vm.statTeam).toEqual(mockTeamEntities());
      });

      it('should not search team if no event selected', async () => {
        teamStore.search = jest.fn();
        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent();

        expect(teamStore.search).toHaveBeenCalledTimes(0);
      });

      it('should clear team information if no event selected', async () => {
        wrapper.vm.selectedTeam = {};
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

          data() {
            return {
              selectedEventId: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
              statTeam: mockTeamEntities(),
            };
          },
          mocks: {
            $services: services,
          },
        });
        selectedTeam = { ...mockTeamEntities()[0] };
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
          ...mockTeamsDataStandard({ teamMembers: [] }),
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
