import eventsFilter from '@/ui/mixins/eventsFilter';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockSearchEventEntity } from '@libs/entities-lib/event';
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
          filter: {
            and: [{ 'Entity/Name/Translation/en': { contains: 'test' } }],
            or: [
              {
                Entity: {
                  Schedule: {
                    Status: 'Open',
                  },
                },
              },
              {
                Entity: {
                  Schedule: {
                    Status: 'OnHold',
                  },
                },
              },
            ],
          },
          top: 10,
          orderBy: 'Entity/Schedule/OpenDate desc',
        });
      });
      it('should assign eventsFilter with results ', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => mockSearchEventEntity());
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.eventsFilter).toEqual([{ text: 'Gatineau Floods 2021', value: '1' }, { text: 'Vegas Earthquake 2021', value: '2' }]);
      });
      it('should change isInitialLoad to false the first time the method is called', async () => {
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.isInitialLoad).toEqual(false);
      });
      it('should only filter on open events if openEventsOnly is true', async () => {
        await wrapper.setData({ openEventsOnly: true });
        await wrapper.vm.fetchEventsFilter('test', 10);
        expect(wrapper.vm.$services.events.search).toHaveBeenCalledWith({
          filter: {
            and: [{ 'Entity/Name/Translation/en': { contains: 'test' } }],
            or: [
              {
                Entity: {
                  Schedule: {
                    Status: 'Open',
                  },
                },
              }, null,
            ],
          },
          top: 10,
          orderBy: 'Entity/Schedule/OpenDate desc',
        });
      });
    });

    describe('fetchEventsByIds', () => {
      it('should fetch events corresponding to the query', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds(['id']);
        expect(wrapper.vm.$services.events.search).toHaveBeenCalledWith({
          filter: 'Entity/Id in(id)',
          top: 999,
        });
      });

      it('should assign eventsFilter with results ', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => mockSearchEventEntity());
        await wrapper.vm.fetchEventsFilter();
        expect(wrapper.vm.eventsFilter).toEqual([{ text: 'Gatineau Floods 2021', value: '1' }, { text: 'Vegas Earthquake 2021', value: '2' }]);
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
          ...[{ text: 'Gatineau Floods 2021', value: '1' }, { text: 'Vegas Earthquake 2021', value: '2' }],
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
