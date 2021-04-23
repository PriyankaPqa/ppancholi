import { createLocalVue, mount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import routes from '@/constants/routes';
import { RcDataTable } from '@crctech/component-library';
import { mockEventsSearchData, Event } from '@/entities/event';
import { mockStorage } from '@/store/storage';
import moment from 'moment';
import Component from './EventsTable.vue';

const localVue = createLocalVue();
const mockEvents = () => mockEventsSearchData().map((ev) => new Event(ev));

describe('EventsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        store: {
          ...mockUserStateLevel(6),
        },
        propsData: {
          isDashboard: false,
        },
      });

      wrapper.vm.azureSearchItems = mockEvents();
      wrapper.vm.azureSearchCount = mockEvents().length;
      wrapper.vm.getEventRoute = jest.fn(() => ({
        name: routes.events.summary.name,
        params: {
          id: 'test-id',
        },
      }));
    });

    describe('data table', () => {
      let dataTable;
      beforeEach(() => {
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values when in edit mode', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(6);

        expect(headers.wrappers[0].find('span').text()).toBe('eventsTable.name');
        expect(headers.wrappers[1].find('span').text()).toBe('eventsTable.levelInteger');
        expect(headers.wrappers[2].find('span').text()).toBe('eventsTable.startDate');
        expect(headers.wrappers[3].find('span').text()).toBe('eventsTable.eventDuration');
        expect(headers.wrappers[4].find('span').text()).toBe('eventsTable.eventStatus');
      });

      describe('showAddButton props', () => {
        it('is true for level 6 users', () => {
          expect(dataTable.props('showAddButton')).toBe(true);
        });

        it('is false for level 5 users and lower', () => {
          wrapper = mount(Component, {
            localVue,
            store: {
              ...mockUserStateLevel(5),
            },
            propsData: {
              isDashboard: false,
            },
          });
          dataTable = wrapper.findComponent(RcDataTable);
          expect(dataTable.props('showAddButton')).toBe(false);
        });
      });

      describe('help button', () => {
        it('displays the help button for level 6 users', () => {
          expect(dataTable.props('showHelp')).toBe(true);
        });

        it('does not display the help button for users level 5 and below', async () => {
          await wrapper.setRole('level5');
          expect(dataTable.props('showHelp')).toBe(false);
        });
      });

      describe('table elements', () => {
        test('event title redirects to getEventRoute', () => {
          const link = wrapper.findDataTest('eventDetail-link');
          expect(link.props('to')).toEqual({
            name: routes.events.summary.name,
            params: {
              id: 'test-id',
            },
          });
        });

        test('edit button calls goToEditEvent', async () => {
          jest.spyOn(wrapper.vm, 'goToEditEvent').mockImplementation(() => {});
          const editButton = wrapper.findDataTest('edit_event');
          await editButton.trigger('click');
          expect(wrapper.vm.goToEditEvent).toHaveBeenCalledTimes(1);
        });

        test('edit button is visible for level 5 users', async () => {
          wrapper = mount(Component, {
            localVue,
            store: {
              ...mockUserStateLevel(5),
            },
            propsData: {
              isDashboard: false,
            },
          });
          wrapper.vm.azureSearchItems = mockEvents();
          wrapper.vm.azureSearchCount = mockEvents().length;
          await wrapper.vm.$nextTick();
          const editButton = wrapper.findDataTest('edit_event');
          expect(editButton.exists()).toBeTruthy();
        });

        test('edit button is not visible for level 4 users', async () => {
          wrapper = mount(Component, {
            localVue,
            store: {
              ...mockUserStateLevel(4),
            },
            propsData: {
              isDashboard: false,
            },
          });
          wrapper.vm.azureSearchItems = mockEvents();
          wrapper.vm.azureSearchCount = mockEvents().length;
          await wrapper.vm.$nextTick();
          const editButton = wrapper.findDataTest('edit_event');
          expect(editButton.exists()).toBeFalsy();
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        store: {
          event: {
            searchLoading: false,
          },
        },
        propsData: {
          isDashboard: false,
        },
      });

      wrapper.vm.azureSearchItems = mockEvents();
      wrapper.vm.azureSearchCount = mockEvents().length;
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper.$i18n = { locale: 'en' };

        const expectedColumns = {
          name: 'EventName/Translation/en',
          responseLevel: 'ResponseLevelName/Translation/en',
          openDate: 'Schedule/OpenDate',
          daysOpen: 'DaysOpen',
          eventStatus: 'ScheduleEventStatusName/Translation/en',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'eventsTable.title',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = mount(Component, {
          localVue,

          propsData: {
            isDashboard: false,
          },
          computed: {
            customColumns() {
              return {
                name: 'EventName/Translation/En',
                responseLevel: 'ResponseLevelName/Translation/En',
                openDate: 'Schedule/OpenDate',
                daysOpen: 'DaysOpen',
                eventStatus: 'ScheduleEventStatusName/Translation/En',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'eventsTable.name',
            align: 'start',
            sortable: true,
            value: 'EventName/Translation/En',
            width: '50%',
          }, {
            text: 'eventsTable.levelInteger',
            value: 'ResponseLevelName/Translation/En',
            sortable: true,
          }, {
            text: 'eventsTable.startDate',
            value: 'Schedule/OpenDate',
            sortable: true,
          }, {
            text: 'eventsTable.eventDuration',
            value: 'DaysOpen',
            sortable: false,
          }, {
            text: 'eventsTable.eventStatus',
            value: 'ScheduleEventStatusName/Translation/En',
            sortable: true,
          }, {
            align: 'end',
            text: '',
            value: 'editButton',
            sortable: false,
          },
        ]);
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps).toEqual({
          loading: false,
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        store: {
          event: {
            searchLoading: false,
          },
        },
        propsData: {
          isDashboard: false,
        },
      });

      wrapper.vm.azureSearchItems = mockEvents();
      wrapper.vm.azureSearchCount = mockEvents().length;
    });
    describe('addEvent', () => {
      it('redirects to the right page', async () => {
        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});

        await wrapper.vm.addEvent();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.create.name });
      });
    });

    describe('fetchData', () => {
      let params;
      beforeEach(() => {
        const storage = mockStorage();
        storage.event.actions.searchEvents = jest.fn(() => ({
          value: mockEvents(),
          odataContext: '',
          odataCount: mockEvents().length,
        }));

        wrapper = mount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
          },
          store: {
            event: {
              searchLoading: false,
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.azureSearchItems = mockEvents();
        wrapper.vm.azureSearchCount = mockEvents().length;
        wrapper.vm.getEventRoute = jest.fn(() => ({
          name: routes.events.summary.name,
          params: {
            id: 'test-id',
          },
        }));

        params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.event.actions.searchEvents).toHaveBeenCalledWith({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });

      it('returns the search results', async () => {
        const res = await wrapper.vm.fetchData(params);
        expect(res.value).toEqual(mockEvents());
      });
    });

    describe('getFilterParams', () => {
      it('should get the filter with correct params', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
          },
          computed: {
            customColumns() {
              return {
                name: 'EventName/Translation/En',
                responseLevel: 'ResponseLevelName/Translation/En',
                openDate: 'Schedule/OpenDate',
                daysOpen: 'DaysOpen',
                eventStatus: 'ScheduleEventStatusName/Translation/En',
              };
            },
          },
        });

        wrapper.vm.azureSearchItems = mockEventsSearchData();
        wrapper.vm.azureSearchCount = mockEventsSearchData().length;

        const params = { search: 'query' };
        const filter = {
          or: [
            {
              'EventName/Translation/En': { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
            },
          ],
        };
        expect(wrapper.vm.getFilterParams(params)).toEqual(filter);
      });
    });

    describe('getEventRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getEventRoute(mockEvents()[0])).toEqual({
          name: routes.events.summary.name,
          params: {
            id: mockEvents()[0].id,
          },
        });
      });
    });

    describe('getFormattedDate', () => {
      it('returns the correct date format', () => {
        expect(wrapper.vm.getFormattedDate('2021-01-01')).toEqual('Jan 1, 2021');
      });
      it('returns a dash when the argument is empty', () => {
        expect(wrapper.vm.getFormattedDate(null)).toEqual('-');
      });
    });

    describe('getDaysOpen', () => {
      it('returns the number of days between open date and close date if both are defined', () => {
        const mockSchedule = {
          openDate: new Date(2021, 1, 1),
          closeDate: new Date(2021, 1, 3),
        };

        expect(wrapper.vm.getDaysOpen(mockSchedule)).toEqual(2);
      });

      it('returns the number of days between open date and today if closeDate is not defined', () => {
        const mockSchedule = {
          openDate: moment().subtract(5, 'days'),
          closeDate: null,
        };

        expect(wrapper.vm.getDaysOpen(mockSchedule)).toEqual(5);
      });

      it('returns the number of days between today and scheduled open date if neither closeDate nor openDate are defined', () => {
        const mockSchedule = {
          scheduledOpenDate: moment().add(5, 'days'),
          openDate: null,
          closeDate: null,
        };

        expect(wrapper.vm.getDaysOpen(mockSchedule)).toEqual(5);
      });
    });

    describe('goToEditEvent', () => {
      it('redirects to the right page', async () => {
        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});
        const mockEvent = mockEvents()[0];
        await wrapper.vm.goToEditEvent(mockEvent);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.edit.name, params: { id: mockEvent.id } });
      });
    });
  });
});
