import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types/FilterTypes';
import helpers from '@/ui/helpers/helpers';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { EResponseLevel, EEventStatus, mockEventEntity, mockEventEntities } from '@libs/entities-lib/event';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { UserRoles } from '@libs/entities-lib/user';

import { sub, add } from 'date-fns';
import Component from './EventsTable.vue';

const localVue = createLocalVue();
const mockEvents = () => mockEventEntities();

const initPinia = (userRole = UserRoles.level6) => {
  const pinia = getPiniaForUser(userRole);
  const { eventStore } = useMockEventStore(pinia);

  return {
    pinia,
    eventStore,
  };
};

describe('EventsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    const doMount = (pinia = initPinia(UserRoles.level6).pinia) => {
      wrapper = mount(Component, {
        pinia,
        localVue,
        propsData: {
          isDashboard: false,
        },

        computed: {
          tableData: () => mockEvents(),
        },
      });

      wrapper.vm.searchResultIds = mockEvents().map((event) => event.id);
      wrapper.vm.itemsCount = mockEvents().length;
      wrapper.vm.getEventRoute = jest.fn(() => ({
        name: routes.events.summary.name,
        params: {
          id: 'test-id',
        },
      }));
    };
    beforeEach(() => {
      doMount();
      wrapper.vm.search = jest.fn();
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
          const { pinia } = initPinia(UserRoles.level5);
          wrapper = mount(Component, {
            localVue,
            pinia,
            propsData: {
              isDashboard: false,
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });
          wrapper.vm.search = jest.fn();
          wrapper.vm.searchResultIds = mockEvents().map((event) => event.id);
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
          doMount(initPinia(UserRoles.level5).pinia);
          expect(dataTable.props('showHelp')).toBe(false);
        });
      });

      describe('table elements', () => {
        test('event title redirects to getEventRoute', () => {
          const link = wrapper.findDataTest(`eventDetail-link_${mockEvents()[0].name.translation.en}`);
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
          const { pinia } = initPinia(UserRoles.level5);
          wrapper = mount(Component, {
            localVue,
            pinia,
            propsData: {
              isDashboard: false,
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });
          wrapper.vm.searchResultIds = mockEvents().map((e) => e.id);
          wrapper.vm.itemsCount = mockEvents().length;
          await wrapper.vm.$nextTick();
          const editButton = wrapper.findDataTest('edit_event');
          expect(editButton.exists()).toBeTruthy();
        });

        test('edit button is not visible for level 4 users', async () => {
          const { pinia } = initPinia(UserRoles.level4);
          wrapper = mount(Component, {
            localVue,
            pinia,
            propsData: {
              isDashboard: false,
            },
            computed: {
              tableData: () => mockEvents(),
            },
          });
          wrapper.vm.searchResultIds = mockEvents().map((e) => e.id);
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
        const { pinia, eventStore } = initPinia(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            isDashboard: false,
          },
        });
        wrapper.vm.search = jest.fn();
        eventStore.getByIdsWithPinnedItems = jest.fn(() => mockEventEntities());
        wrapper.vm.searchResultIds = mockEventEntities().map((e) => e.id);
        wrapper.vm.itemsCount = mockEventEntities().length;

        expect(JSON.stringify(wrapper.vm.tableData)).toEqual(JSON.stringify(mockEventEntities()));
        expect(eventStore.getByIdsWithPinnedItems).toHaveBeenCalledWith(
          wrapper.vm.searchResultIds,
          { baseDate: null },
        );
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        const { pinia } = initPinia(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            isDashboard: false,
          },
        });
        wrapper.$i18n = { locale: 'en' };

        const expectedColumns = {
          name: 'Entity/Name/Translation/en',
          responseLevel: 'Metadata/ResponseLevel/Translation/en',
          openDate: 'Entity/Schedule/OpenDate',
          daysOpen: 'DaysOpen',
          eventStatus: 'Metadata/EventStatus/Translation/en',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        const { pinia } = initPinia(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
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
        const { pinia } = initPinia(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            isDashboard: false,
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
        wrapper.vm.search = jest.fn();
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
            text: 'common.edit',
            class: 'rc-transparent-text',
            value: 'editButton',
            sortable: false,
          },
        ]);
      });
    });

    describe('filters', () => {
      it('should have correct filters', () => {
        const { pinia } = initPinia(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            isDashboard: false,
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
        wrapper.vm.search = jest.fn();
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
        const { pinia, eventStore } = initPinia(UserRoles.level6);
        eventStore.searchLoading = false;
        wrapper = mount(Component, {
          localVue,
          pinia,

          propsData: {
            isDashboard: false,
          },
        });
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('canEdit', () => {
      it('returns true if user is level 5 and event is on hold', () => {
        const { pinia } = initPinia(UserRoles.level5);
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });
        wrapper.vm.search = jest.fn();
        const event = mockEventEntity({ schedule: { status: EEventStatus.OnHold } });

        expect(wrapper.vm.canEdit(event)).toBeTruthy();
      });

      it('returns true if user is level 5 and event is on hold', () => {
        const { pinia } = initPinia(UserRoles.level5);
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });
        wrapper.vm.search = jest.fn();
        const event = mockEventEntity({ schedule: { status: EEventStatus.OnHold } });

        expect(wrapper.vm.canEdit(event)).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open or on hold', () => {
        const { pinia } = initPinia(UserRoles.level5);
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });
        wrapper.vm.search = jest.fn();
        const event = mockEventEntity({ schedule: { status: EEventStatus.Closed } });

        expect(wrapper.vm.canEdit(event)).toBeFalsy();
      });

      it('returns false if user is not level 5', () => {
        const { pinia } = initPinia(UserRoles.level4);
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });
        wrapper.vm.search = jest.fn();
        const event = mockEventEntity({ schedule: { status: EEventStatus.Open } });

        expect(wrapper.vm.canEdit(event)).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    const { pinia, eventStore } = initPinia(UserRoles.level4);
    const doMount = () => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          isDashboard: false,
        },

      });

      eventStore.search = jest.fn(() => ({
        ids: [mockEvents()[0].id, mockEvents()[1].id],
        count: mockEvents().length,
      }));
    };

    beforeEach(() => {
      doMount();
    });

    describe('addEvent', () => {
      it('redirects to the right page', async () => {
        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});

        await wrapper.vm.addEvent();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.create.name });
      });
    });

    describe('fetchData', () => {
      it('should call EventStore search with proper parameters', async () => {
        const params = {
          filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
        await wrapper.vm.fetchData(params);

        expect(eventStore.search).toHaveBeenCalledWith({ params: {
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: false });
      });
    });

    describe('getEventRoute', () => {
      it('returns the right route object when feature flag is off', () => {
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
        expect(wrapper.vm.getFormattedDate('2023-06-23T14:10:11.5499981Z')).toEqual('Jun 23, 2023');
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
          openDate: sub(new Date(), { days: 5 }),
          closeDate: null,
        };

        expect(wrapper.vm.getDaysOpen(mockSchedule)).toEqual(5);
      });

      it('returns the number of days between today and scheduled open date if neither closeDate nor openDate are defined', () => {
        const mockSchedule = {
          scheduledOpenDate: add(new Date(), { days: 5 }),
          openDate: null,
          closeDate: null,
        };

        expect(wrapper.vm.getDaysOpen(mockSchedule)).toEqual(5);
      });
    });

    describe('goToEditEvent', () => {
      it('redirects to the right page', async () => {
        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});
        const mockEvent = mockEventEntity();
        await wrapper.vm.goToEditEvent(mockEvent);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.edit.name, params: { id: mockEvent.id } });
      });
    });
  });
});
