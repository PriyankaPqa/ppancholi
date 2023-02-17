import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

import Component from './EventStats.vue';

const localVue = createLocalVue();

const { pinia, caseFileStore } = useMockCaseFileStore();

describe('EventStats.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.title).toEqual('event_stats.title');
      });
    });

    describe('tip', () => {
      it('returns correct value', async () => {
        await wrapper.setData({
          currentTab: 0,
        });

        expect(wrapper.vm.tip).toEqual(['event_stats.tip.number_of_case_file', 'event_stats.tip.case_file_group_by.status']);

        await wrapper.setData({
          currentTab: 1,
        });

        expect(wrapper.vm.tip).toEqual(['event_stats.tip.number_of_open_case_file', 'event_stats.tip.case_file_group_by.assigned']);

        await wrapper.setData({
          currentTab: 2,
        });

        expect(wrapper.vm.tip).toEqual(['event_stats.tip.number_of_case_file', 'event_stats.tip.case_file_group_by.triage']);
      });
    });
  });

  describe('Methods', () => {
    describe('selectEvent', () => {
      beforeEach(async () => {
        jest.clearAllMocks();
      });
      const event = mockEventEntity();
      const selectedEventId = event.id;
      it('should call fetchCaseFileDetailedCounts', async () => {
        await wrapper.vm.selectEvent(selectedEventId);
        expect(caseFileStore.fetchCaseFileDetailedCounts).toHaveBeenCalledWith(selectedEventId);
      });

      it('should call fetchCaseFileAssignedCounts', async () => {
        await wrapper.vm.selectEvent(selectedEventId);
        expect(caseFileStore.fetchCaseFileAssignedCounts).toHaveBeenCalledWith(selectedEventId, null);
      });

      it('should not call fetchCaseFileDetailedCounts if no event selected', async () => {
        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent(null);

        expect(caseFileStore.fetchCaseFileDetailedCounts).toHaveBeenCalledTimes(0);
      });

      it('should clear stats information if no event selected', async () => {
        wrapper.vm.quickStats = {
          inactiveCount: 2,
          closedCount: 3,
        };
        wrapper.vm.openCount = 100;

        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent(null);

        expect(wrapper.vm.quickStats).toBe(null);
        expect(wrapper.vm.openCount).toBe(0);
      });
    });
  });

  describe('Template', () => {
    describe('Events Selector', () => {
      it('should have fetch-all-events props', () => {
        const component = wrapper.findComponent(EventsSelector);
        expect(component.props('fetchAllEvents')).toBe(true);
      });
    });
  });
});
