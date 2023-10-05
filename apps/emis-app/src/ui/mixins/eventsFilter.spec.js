import eventsFilter from '@/ui/mixins/eventsFilter';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockSearchEventsData } from '@libs/entities-lib/registration-event';
import { EEventStatus } from '@libs/entities-lib/event';
import { mockProvider } from '@/services/provider';

const Component = {
  render() {},
  mixins: [eventsFilter],
};

const localVue = createLocalVue();
const services = mockProvider();

const wrapper = shallowMount(Component, {
  localVue,
  mocks: {
    $services: services,
  } });

describe('eventsFilter', () => {
  describe('Methods', () => {
    describe('fetchEventsFilter', () => {
      it('should fetch events corresponding to the query', async () => {
        await wrapper.vm.fetchEventsFilter('test', 10);
        expect(wrapper.vm.$services.events.search).toHaveBeenCalledWith({
          search: '((/.*test.*/ OR "\\"test\\""))',
          searchFields: 'Entity/Name/Translation/en',
          filter: {
            or: [
              {
                Entity: {
                  Schedule: {
                    Status: EEventStatus.Open,
                  },
                },
              },
              {
                Entity: {
                  Schedule: {
                    Status: EEventStatus.OnHold,
                  },
                },
              },
            ],
          },
          top: 10,
          orderBy: 'Entity/Schedule/OpenDate desc',
          queryType: 'full',
          searchMode: 'all',
        });
      });
      it('should assign eventsFilter with results ', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => mockSearchEventsData());
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.eventsFilter).toEqual([{ text: 'Gatineau Floods 2021', value: '7c076603-580a-4400-bef2-5ddececb0931' }]);
      });
      it('should change isInitialLoad to false the first time the method is called', async () => {
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.isInitialLoad).toEqual(false);
      });
    });

    describe('fetchEventsByIds', () => {
      it('should fetch events corresponding to the query', async () => {
        await wrapper.vm.fetchEventsByIds(['id']);
        expect(wrapper.vm.$services.events.search).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['id'] } } },
          top: 999,
        });
      });

      it('should assign eventsFilter with results ', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => mockSearchEventsData());
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.eventsFilter).toEqual([{ text: 'Gatineau Floods 2021', value: '7c076603-580a-4400-bef2-5ddececb0931' }]);
      });
    });

    describe('onLoadFilter', () => {
      it('should call fetchEventsByIds with selected event id', async () => {
        wrapper.vm.fetchEventsByIds = jest.fn();
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadFilter(filterFormData);
        expect(wrapper.vm.fetchEventsByIds).toHaveBeenCalledWith(['1']);
      });

      it('should add the result to eventsFilter', async () => {
        wrapper.vm.fetchEventsByIds = jest.fn(() => ([{
          text: 'event',
          value: '1',
        }]));
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadFilter(filterFormData);
        expect(wrapper.vm.eventsFilter).toEqual([
          ...[{ text: 'event', value: '1' }],
          ...[{ text: 'Gatineau Floods 2021', value: '7c076603-580a-4400-bef2-5ddececb0931' }],
        ]);
      });

      it('calls onLoadAdditionalFilters', async () => {
        wrapper.vm.onLoadAdditionalFilters = jest.fn();
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadFilter(filterFormData);
        expect(wrapper.vm.onLoadAdditionalFilters).toHaveBeenCalled();
      });
    });

    describe('debounceSearchEventsFilter', () => {
      it('should call fetchEventsFilter', async () => {
        wrapper.vm.fetchEventsFilter = jest.fn();

        wrapper.vm.debounceSearchEventsFilter();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(wrapper.vm.fetchEventsFilter).toHaveBeenCalledTimes(1);
      });
    });

    describe('throttleOnLoadFilter', () => {
      it('should throttle onLoadFilter', async () => {
        wrapper.vm.onLoadFilter = jest.fn();

        wrapper.vm.throttleOnLoadFilter();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 300));
        wrapper.vm.throttleOnLoadFilter();

        expect(wrapper.vm.onLoadFilter).toHaveBeenCalledTimes(1);
      });
    });

    describe('onAutoCompleteUpdate', () => {
      it('should set eventFilterQuery', () => {
        wrapper.vm.onAutoCompleteUpdate({
          filterKey: 'Entity/EventId',
          search: 'search',
          selectedItem: { text: '', value: '' },
        });

        expect(wrapper.vm.eventFilterQuery).toEqual('search');
      });

      it('should set eventFilterQuery if filter key is Metadata/EventId', () => {
        wrapper.vm.onAutoCompleteUpdate({
          filterKey: 'Metadata/EventId',
          search: 'search',
          selectedItem: { text: '', value: '' },
        });

        expect(wrapper.vm.eventFilterQuery).toEqual('search');
      });
    });
  });
  describe('Watch', () => {
    describe('eventFilterQuery', () => {
      it('should call debounceSearchEventsFilter with trimmed query', async () => {
        wrapper.vm.debounceSearchEventsFilter = jest.fn();
        await wrapper.setData({
          eventFilterQuery: 'query    ',
        });

        expect(wrapper.vm.debounceSearchEventsFilter).toHaveBeenCalledWith('query');
      });

      it('should reset eventsFilter if no value', async () => {
        wrapper.vm.debounceSearchEventsFilter = jest.fn();
        await wrapper.setData({
          eventFilterQuery: '',
          eventsFilter: ['data'],
        });

        expect(wrapper.vm.eventsFilter).toEqual([]);
      });
    });
  });
});
