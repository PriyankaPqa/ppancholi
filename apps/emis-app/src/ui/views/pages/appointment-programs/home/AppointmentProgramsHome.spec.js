import { RcDataTable } from '@libs/component-lib/components';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockAppointmentProgram } from '@libs/entities-lib/appointment';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';

import Component from './AppointmentProgramsHome.vue';

const localVue = createLocalVue();

const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('AppointmentProgramsHome.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'event-id',
        },
        computed: {
          tableData: () => ([mockAppointmentProgram({ id: 1 })]),
        },
      });
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

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(4);

        expect(headers.wrappers[0].find('span').text()).toBe('common.name');
        expect(headers.wrappers[1].find('span').text()).toBe('common.status');
        expect(headers.wrappers[2].find('span').text()).toBe('common.edit');
        expect(headers.wrappers[3].find('span').text()).toBe('common.delete');
      });
    });

    describe('table elements', () => {
      test('program name redirects to program details', () => {
        const link = wrapper.findDataTest(`appointmentProgramDetail-link-${wrapper.vm.tableData[0].id}`);
        expect(link.props('to')).toEqual({
          name: routes.events.appointmentPrograms.details.name,
          params: { appointmentProgramId: 1 },
        });
      });

      test('edit button redirects to edit program', () => {
        const link = wrapper.findDataTest('editAppointmentProgram-link');
        expect(link.props('to')).toEqual({
          name: routes.events.appointmentPrograms.edit.name,
          params: { appointmentProgramId: 1 },
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: 'event-id',
        },
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'event-id',
          },
          computed: {
            locale() {
              return 'en';
            },
          },
        });

        const expectedColumns = {
          name: 'Entity/Name/Translation/en',
          appointmentProgramStatus: 'appointmentProgramStatus',
          edit: 'edit',
          delete: 'delete',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
            id: 'event-id',
          },
          computed: {
            customColumns() {
              return {
                name: 'Entity/Name/Translation/en',
                appointmentProgramStatus: 'appointmentProgramStatus',
                edit: 'edit',
                delete: 'delete',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: 'Entity/Name/Translation/en',
            width: '80%',
          },
          {
            text: 'common.status',
            sortable: false,
            value: 'appointmentProgramStatus',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: 'edit',
            align: 'end',
            width: '5%',
          },
          {
            text: 'common.delete',
            class: 'rc-transparent-text',
            sortable: false,
            value: 'delete',
            width: '5%',
          },
        ]);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'appointmentPrograms.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'appointmentPrograms.addProgram',
          },
        });
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(appointmentProgramStore.searchLoading);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('tableData', () => {
      it('returns the correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'event-id',
          },
        });

        appointmentProgramStore.getByIdsWithPinnedItems = jest.fn(() => [mockAppointmentProgram()]);
        wrapper.vm.searchResultIds = [mockAppointmentProgram().id];

        expect(wrapper.vm.tableData).toEqual([mockAppointmentProgram()]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'event-id',
        },

      });

      appointmentProgramStore.search = jest.fn(() => ({
        ids: [mockAppointmentProgram().id],
        count: 1,
      }));
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: {}, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call programStore search with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(appointmentProgramStore.search).toHaveBeenCalledWith({ params: {
          filter: {
            'Entity/EventId': { value: 'event-id', type: 'guid' },
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: false });
      });
    });

    describe('getAppointmentProgramDetailsRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getAppointmentProgramDetailsRoute(mockAppointmentProgram())).toEqual({
          name: routes.events.appointmentPrograms.details.name,
          params: {
            appointmentProgramId: mockAppointmentProgram().id,
          },
        });
      });
    });

    describe('getAppointmentProgramEditRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getAppointmentProgramEditRoute(mockAppointmentProgram())).toEqual({
          name: routes.events.appointmentPrograms.edit.name,
          params: {
            appointmentProgramId: mockAppointmentProgram().id,
          },
        });
      });
    });

    describe('deleteAppointmentProgram', () => {
      it('calls store delete after confirmation and displays a toast message', async () => {
        const mock = mockAppointmentProgram();
        await wrapper.vm.deleteAppointmentProgram(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'appointmentPrograms.confirm.delete.title',
          messages: 'appointmentPrograms.confirm.delete.message',
        });
        expect(appointmentProgramStore.deleteAppointmentProgram)
          .toHaveBeenCalledWith(mock.id);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.deleted');
      });
      it('doesnt call delete if no confirmation', async () => {
        const mock = mockAppointmentProgram();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteAppointmentProgram(mock.id);
        expect(appointmentProgramStore.deleteAppointmentProgram)
          .toHaveBeenCalledTimes(0);
      });

      it('displays an error message on store call error', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        appointmentProgramStore.deleteAppointmentProgram = jest.fn();
        await wrapper.vm.deleteAppointmentProgram('id');
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.deleted.failed');
      });
    });
  });
});
