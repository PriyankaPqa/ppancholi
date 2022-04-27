import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from './EventStats.vue';

const storage = mockStorage();

const localVue = createLocalVue();

describe('EventStats.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Live cycle', () => {
    describe('created', () => {
      it('calls searchMyEvents', async () => {
        wrapper.vm.$services = {
          events: {
            searchMyEvents: jest.fn(),
          },
        };

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledTimes(1);
      });
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

    describe('eventPlaceholder', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.eventPlaceholder).toEqual('event_stats.event.placeholder');
      });
    });

    describe('sortedEvents', () => {
      it('returns sorted value', async () => {
        const mockEvents = [
          {
            entity: {
              name: {
                translation: {
                  en: 'en name 1',
                  fr: 'fr name 1',
                },
              },
            },
          },
          {
            entity: {
              name: {
                translation: {
                  en: 'en name 2',
                  fr: 'fr name 2',
                },
              },
            },
          },
        ];

        await wrapper.setData({
          events: mockEvents,
        });

        expect(wrapper.vm.sortedEvents[0].entity.name.translation.en).toEqual('en name 1');

        mockEvents[0].entity.name.translation.en = 'en name 3';
        expect(wrapper.vm.sortedEvents[0].entity.name.translation.en).toEqual('en name 2');
      });
    });
  });

  describe('Methods', () => {
    describe('selectEvent', () => {
      const selectedEventId = 'selectedEventId';

      beforeEach(async () => {
        jest.clearAllMocks();
        await wrapper.setData({
          selectedEventId,
        });
      });

      it('should call fetchCaseFileDetailedCounts', async () => {
        await wrapper.vm.selectEvent();

        expect(wrapper.vm.$storage.caseFile.actions.fetchCaseFileDetailedCounts).toHaveBeenCalledWith(selectedEventId);
      });

      it('should call fetchCaseFileAssignedCounts', async () => {
        await wrapper.vm.selectEvent();

        expect(wrapper.vm.$storage.caseFile.actions.fetchCaseFileAssignedCounts).toHaveBeenCalledWith(selectedEventId, null);
      });

      it('should not call fetchCaseFileDetailedCounts if no event selected', async () => {
        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent();

        expect(wrapper.vm.$storage.caseFile.actions.fetchCaseFileDetailedCounts).toHaveBeenCalledTimes(0);
      });

      it('should clear stats information if no event selected', async () => {
        wrapper.vm.quickStats = {
          inactiveCount: 2,
          closedCount: 3,
        };
        wrapper.vm.openCount = 100;

        wrapper.vm.selectedEventId = null;

        await wrapper.vm.selectEvent();

        expect(wrapper.vm.quickStats).toBe(null);
        expect(wrapper.vm.openCount).toBe(0);
      });
    });
  });
});
