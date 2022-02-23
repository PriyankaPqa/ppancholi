/**
 * @group ui/components/events
 */

import { RcDataTable } from '@crctech/component-library';
import moment from 'moment';
import { EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import helpers from '@/ui/helpers/helpers';
import { createLocalVue, mount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import {
  mockCombinedEvents, mockCombinedEvent, mockEventEntities, mockEventMetadata, EResponseLevel, EEventStatus, mockEventEntity,
} from '@/entities/event';
import Component from './EventsTable.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const mockEvents = () => mockCombinedEvents();

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
        mocks: {
          $storage: {
            event: {
              getters: {
                getByIds: jest.fn(() => mockCombinedEvents()),
              },
              actions: {
                search: jest.fn(() => ({
                  ids: [mockEvents()[0].id, mockEvents()[1].id],
                  count: mockEvents().length,
                })),
              },
            },
          },
        },

        computed: {
          tableData: () => mockEvents(),
        },
      });

      wrapper.vm.searchResultIds = mockEvents().map((event) => event.entity.id);
      wrapper.vm.itemsCount = mockEvents().length;
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
            mocks: {
              $storage: {
                event: {
                  getters: {
                    getByIds: jest.fn(() => mockCombinedEvents()),
                  },
                  actions: {
                    search: jest.fn(() => ({
                      ids: [mockEvents()[0].id, mockEvents()[1].id],
                      count: mockEvents().length,
                    })),
                  },
                },
              },
            },
            propsData: {
              isDashboard: false,
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });

          wrapper.vm.searchResultIds = mockEvents().map((event) => event.entity.id);
          wrapper.vm.itemsCount = mockEvents().length;
          dataTable = wrapper.findComponent(RcDataTable);
          expect(dataTable.props('showAddButton')).toBe(false);
        });
      });

      describe('help button', () => {
        it('should be hidden for now (displays the help button for level 6 users)', () => {
          expect(dataTable.props('showHelp')).toBe(false);
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
            mocks: {
              $storage: {
                event: {
                  getters: {
                    getByIds: jest.fn(() => mockCombinedEvents()),
                  },
                  actions: {
                    search: jest.fn(() => ({
                      ids: [mockEvents()[0].id, mockEvents()[1].id],
                      count: mockEvents().length,
                    })),
                  },
                },
              },
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });
          wrapper.vm.searchResultIds = mockEvents().map((e) => e.entity.id);
          wrapper.vm.itemsCount = mockEvents().length;
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
            mocks: {
              $storage: {
                event: {
                  getters: {
                    getByIds: jest.fn(() => mockCombinedEvents()),
                  },
                  actions: {
                    search: jest.fn(() => ({
                      ids: [mockEvents()[0].id, mockEvents()[1].id],
                      count: mockEvents().length,
                    })),
                  },
                },
              },
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });
          wrapper.vm.searchResultIds = mockEvents().map((e) => e.entity.id);
          wrapper.vm.itemsCount = mockEvents().length;
          await wrapper.vm.$nextTick();
          const editButton = wrapper.findDataTest('edit_event');
          expect(editButton.exists()).toBeFalsy();
        });
      });
    });
  });

  describe('Computed', () => {
    describe('tableData', () => {
      it('should return the correct values', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            event: {
              searchLoading: false,
              entities: mockEventEntities(),
              metadata: mockEventMetadata(),
            },
          },
          mocks: {
            $storage: storage,
          },
          propsData: {
            isDashboard: false,
          },
        });
        wrapper.vm.$storage.event.getters.getByIds = jest.fn(mockCombinedEvents);
        wrapper.vm.searchResultIds = mockEvents().map((e) => e.entity.id);
        wrapper.vm.itemsCount = mockEvents().length;

        expect(JSON.stringify(wrapper.vm.tableData)).toEqual(JSON.stringify(mockEvents()));
        expect(wrapper.vm.$storage.event.getters.getByIds).toHaveBeenCalledWith(wrapper.vm.searchResultIds,
          { baseDate: null, prependPinnedItems: true });
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            event: {
              searchLoading: false,
              entities: mockEvents(),
            },
          },
          mocks: {
            $storage: storage,
          },
          propsData: {
            isDashboard: false,
          },
        });
        wrapper.$i18n = { locale: 'en' };

        const expectedColumns = {
          name: 'Entity/Name/Translation/en',
          responseLevel: 'Metadata/ResponseLevelName/Translation/en',
          openDate: 'Entity/Schedule/OpenDate',
          daysOpen: 'DaysOpen',
          eventStatus: 'Metadata/ScheduleEventStatusName/Translation/en',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            event: {
              searchLoading: false,
              entities: mockEvents(),
            },
          },
          mocks: {
            $storage: storage,
          },
          propsData: {
            isDashboard: false,
          },
        });
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'eventsTable.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'eventsTable.addEvent',
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
          mocks: {
            $storage: storage,
          },
          computed: {
            customColumns() {
              return {
                name: 'Entity/Name/Translation/En',
                responseLevel: 'Metadata/ResponseLevelName/Translation/En',
                openDate: 'Entity/Schedule/OpenDate',
                daysOpen: 'DaysOpen',
                eventStatus: 'Metadata/ScheduleEventStatusName/Translation/En',
              };
            },
            tableData: () => mockEvents(),
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'eventsTable.name',
            align: 'start',
            sortable: true,
            value: 'Entity/Name/Translation/En',
            width: '50%',
          }, {
            text: 'eventsTable.levelInteger',
            value: 'Metadata/ResponseLevelName/Translation/En',
            sortable: true,
          }, {
            text: 'eventsTable.startDate',
            value: 'Entity/Schedule/OpenDate',
            sortable: true,
          }, {
            text: 'eventsTable.eventDuration',
            value: 'DaysOpen',
            sortable: false,
          }, {
            text: 'eventsTable.eventStatus',
            value: 'Metadata/ScheduleEventStatusName/Translation/En',
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
    describe('filters', () => {
      it('should have correct filters', () => {
        wrapper = mount(Component, {
          localVue,

          propsData: {
            isDashboard: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            customColumns() {
              return {
                name: 'Entity/Name/Translation/en',
                responseLevel: 'Metadata/ResponseLevelName/Translation/en',
                openDate: 'Entity/Schedule/OpenDate',
                daysOpen: 'DaysOpen',
                eventStatus: 'Metadata/ScheduleEventStatusName/Translation/en',
              };
            },
            tableData: () => mockEvents(),
          },
        });

        const expected = [
          {
            key: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.Text,
            label: 'eventsTable.name',
          },
          {
            key: `Metadata/ResponseLevelName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'eventsTable.levelInteger',
            items: helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level', true),
          },
          {
            key: 'Entity/Schedule/OpenDate',
            type: EFilterType.Date,
            label: 'eventsTable.startDate',
          },
          {
            key: `Metadata/ScheduleEventStatusName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'eventsTable.eventStatus',
            items: helpers.enumToTranslatedCollection(EEventStatus, 'eventsTable.eventStatus', true),
          },
        ];
        expect(wrapper.vm.filters).toEqual(expected);
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            event: {
              searchLoading: false,
              entities: mockEvents(),
            },
          },
          mocks: {
            $storage: storage,
          },
          propsData: {
            isDashboard: false,
          },
        });
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('canEdit', () => {
      it('returns true if user is level 5 and event is on hold', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
            $storage: {
              event: {
                getters: {
                  getByIds: jest.fn(() => mockCombinedEvents()),
                },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockEvents()[0].id, mockEvents()[1].id],
                    count: mockEvents().length,
                  })),
                },
              },
            },
          },

        });

        const event = mockCombinedEvent({
          ...mockEventEntity({ schedule: { status: EEventStatus.OnHold } }),
        });

        expect(wrapper.vm.canEdit(event)).toBeTruthy();
      });

      it('returns true if user is level 5 and event is on hold', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
            $storage: {
              event: {
                getters: {
                  getByIds: jest.fn(() => mockCombinedEvents()),
                },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockEvents()[0].id, mockEvents()[1].id],
                    count: mockEvents().length,
                  })),
                },
              },
            },
          },
        });

        const event = mockCombinedEvent({
          ...mockEventEntity({ schedule: { status: EEventStatus.OnHold } }),
        });

        expect(wrapper.vm.canEdit(event)).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open or on hold', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
            $storage: {
              event: {
                getters: {
                  getByIds: jest.fn(() => mockCombinedEvents()),
                },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockEvents()[0].id, mockEvents()[1].id],
                    count: mockEvents().length,
                  })),
                },
              },
            },
          },
        });

        const event = mockCombinedEvent({
          ...mockEventEntity({ schedule: { status: EEventStatus.Closed } }),
        });

        expect(wrapper.vm.canEdit(event)).toBeFalsy();
      });

      it('returns false if user is not level 5', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(4),
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
            $storage: {
              event: {
                getters: {
                  getByIds: jest.fn(() => mockCombinedEvents()),
                },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockEvents()[0].id, mockEvents()[1].id],
                    count: mockEvents().length,
                  })),
                },
              },
            },
          },
        });

        const event = mockCombinedEvent({
          ...mockEventEntity({ schedule: { status: EEventStatus.Open } }),
        });

        expect(wrapper.vm.canEdit(event)).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.event.actions.search = jest.fn(() => ({
        ids: [mockEvents()[0].id, mockEvents()[1].id],
        count: mockEvents().length,
      }));

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
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('addEvent', () => {
      it('redirects to the right page', async () => {
        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});

        await wrapper.vm.addEvent();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.create.name });
      });
    });

    describe('fetchData', () => {
      it('should call storage actions with proper parameters', async () => {
        const params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.event.actions.search).toHaveBeenCalledWith({
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
    });

    describe('getFilterParams', () => {
      it('should get the filter with correct params', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
          },
          store: {
            ...mockUserStateLevel(6),
          },
          mocks: {
            $storage: {
              event: {
                getters: {
                  getByIds: jest.fn(() => mockCombinedEvents()),
                },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockEvents()[0].id, mockEvents()[1].id],
                    count: mockEvents().length,
                  })),
                },
              },
            },
          },
          computed: {
            customColumns() {
              return {
                name: 'Entity/Name/Translation/En',
                responseLevel: 'Metadata/ResponseLevelName/Translation/En',
                openDate: 'Entity/Schedule/OpenDate',
                daysOpen: 'DaysOpen',
                eventStatus: 'Metadata/ScheduleEventStatusName/Translation/En',
              };
            },
          },
        });

        wrapper.vm.searchResultIds = mockEvents().map((e) => e.entity.id);
        wrapper.vm.itemsCount = mockEvents().length;

        const params = { search: 'query' };
        const filter = {
          or: [
            {
              'Entity/Name/Translation/En': { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
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
            id: mockEvents()[0].entity.id,
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
        const mockEvent = mockCombinedEvent();
        await wrapper.vm.goToEditEvent(mockEvent);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.edit.name, params: { id: mockEvent.entity.id } });
      });
    });
  });
});
