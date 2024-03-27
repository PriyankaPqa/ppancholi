import { shallowMount, createLocalVue } from '@/test/testSetup';
import routes from '@/constants/routes';
import { EFilterKeyType, EFilterType } from '@libs/component-lib/types';
import { mockProgramEntities, mockProgramEntity } from '@libs/entities-lib/program';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { useMockApprovalTableStore } from '@/pinia/approval-table/approval-table.mock';
import Component from './ApprovalTablesHome.vue';

const localVue = createLocalVue();
let wrapper;
const { approvalTableStore, pinia } = useMockApprovalTableStore();
const table = { entity: mockApprovalTableEntity(), metadata: {}, pinned: false };

const doMount = () => {
  const options = {
    localVue,
    pinia,
    data() {
      return { params: { filter: {} } };
    },
    mocks: {
      $route: {
        params: {
          id: '1',
        },
      },
    },
  };

  wrapper = shallowMount(Component, options);

  wrapper.vm.combinedApprovalTableStore.search = jest.fn();
  wrapper.vm.combinedApprovalTableStore.getByIds = jest.fn(() => [table]);
  wrapper.vm.combinedProgramStore.search = jest.fn(() => ({
    ids: [mockProgramEntities()[0].id, mockProgramEntities()[1].id],
    count: mockProgramEntities().length,
  }));
};

describe('ApprovalTablesHome.vue', () => {
  describe('Methods', () => {
    describe('goToCreate', () => {
      it('should redirect to create page', () => {
        doMount();
        wrapper.vm.goToCreate();
        expect(wrapper.vm.$router.push).toBeCalledWith({ name: routes.events.approvals.create.name });
      });
    });

    describe('goToCopyFromTemplate', () => {
      it('should do nothing for now', () => {
        doMount();
        wrapper.vm.goToCopyFromTemplate();
        expect(true).toEqual(true);
      });
    });

    describe('goToEdit', () => {
      it('should redirect to edit page', () => {
        doMount();
        wrapper.vm.goToEdit('1');
        expect(wrapper.vm.$router.push).toBeCalledWith({ name: routes.events.approvals.edit.name, params: { approvalId: '1' } });
      });
    });

    describe('deleteItem', () => {
      it('should show confirmation popup', () => {
        doMount();
        wrapper.vm.deleteItem('1');
        expect(wrapper.vm.$confirm).toBeCalledWith({
          messages: 'approvalTables.confirm.delete.message',
          title: 'common.delete',
        });
      });

      it('should call deactivate method when user confirm', async () => {
        doMount();
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.vm.deleteItem('1');
        expect(approvalTableStore.deactivate).toBeCalledWith('1');
      });
    });

    describe('getDetailsRoute', () => {
      it('should return details route', () => {
        doMount();
        const expected = wrapper.vm.getDetailsRoute('1');
        expect(expected).toEqual({
          name: routes.events.approvals.details.name,
          params: {
            approvalId: '1',
          },
        });
      });
    });

    describe('handleCreate', () => {
      it('should call goToCreate if user selected create new', () => {
        doMount();
        wrapper.vm.goToCreate = jest.fn();
        wrapper.vm.handleCreate({ value: 'createNew' });
        expect(wrapper.vm.goToCreate).toBeCalled();
      });

      it('should call goToCopyFromTemplate if user selected copy from template', () => {
        doMount();
        wrapper.vm.goToCopyFromTemplate = jest.fn();
        wrapper.vm.handleCreate({ value: 'copyFrom' });
        expect(wrapper.vm.goToCopyFromTemplate).toBeCalled();
      });
    });

    describe('fetchData', () => {
      it('should call search with proper params', () => {
        doMount();
        const params = {
          search: 'query',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
          filter: { 'Entity/EventId': { value: '1', type: EFilterKeyType.Guid } },
        };

        wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedApprovalTableStore.search).toBeCalledWith({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, false, true);
      });
    });

    describe('fetchPrograms', () => {
      it('calls combinedProgramStore search', async () => {
        doMount();

        await wrapper.vm.fetchPrograms();

        expect(wrapper.vm.combinedProgramStore.search).toHaveBeenLastCalledWith({
          filter: {
            'Entity/EventId': { value: wrapper.vm.eventId, type: EFilterKeyType.Guid },
          },
          count: true,
          orderBy: 'Entity/Name/Translation/en',
          queryType: 'full',
          searchMode: 'all',
        }, null, true, true);
      });
    });
  });

  describe('Computed', () => {
    describe('eventId', () => {
      it('should be linked to route id parameter', () => {
        doMount();
        expect(wrapper.vm.eventId).toEqual('1');
      });
    });

    describe('tableData', () => {
      it('should return getByIds', () => {
        doMount();
        expect(wrapper.vm.tableData).toEqual([table, table]);
      });
    });

    describe('customColumns', () => {
      it('should return proper columns', () => {
        doMount();
        expect(wrapper.vm.customColumns).toEqual({
          program: 'Metadata/ProgramName/Translation/en',
          name: 'Entity/Name/Translation/en',
          approvalBaseStatus: 'Metadata/ApprovalBaseStatusName/Translation/en',
        });
      });
    });

    describe('labels', () => {
      it('should return proper labels', () => {
        doMount();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'approvalsTable.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'approvalsTable.addApprovals',
          },
        });
      });
    });

    describe('headers', () => {
      it('should return proper headers', () => {
        doMount();
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'approvalsTable.programName',
            align: 'start',
            sortable: false,
            value: wrapper.vm.customColumns.program,
            width: '20%',
          },
          {
            text: 'approvalsTable.name',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '60%',
          },
          {
            text: 'common.status',
            align: 'center',
            sortable: true,
            value: wrapper.vm.customColumns.approvalBaseStatus,
            width: '50px',
          },
          {
            align: 'end',
            text: 'task.action',
            class: 'rc-transparent-text',
            value: 'actions',
            sortable: false,
            width: '120px',
          },
        ]);
      });
    });

    describe('filters', () => {
      it('should return proper filters', async () => {
        doMount();

        await wrapper.setData({
          programs: [mockProgramEntity()],
        });

        expect(wrapper.vm.filters).toEqual([{
          key: wrapper.vm.customColumns.program,
          type: EFilterType.MultiSelect,
          label: 'approvalsTable.programName',
          items: wrapper.vm.programs.map((p) => ({
            value: wrapper.vm.$m(p.name),
            text: wrapper.vm.$m(p.name),
          })),
        }, {
          key: wrapper.vm.customColumns.name,
          type: EFilterType.Text,
          label: 'common.name',
        }, {
          key: wrapper.vm.customColumns.approvalBaseStatus,
          type: EFilterType.MultiSelect,
          label: 'common.status',
          items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true, false),
        },
        ]);
      });
    });

    describe('menuItems', () => {
      it('should return proper menuItems', async () => {
        doMount();

        expect(wrapper.vm.menuItems).toEqual([{
          text: 'approvalTables.create_new_table',
          icon: 'mdi-file',
          value: 'createNew',
          dataTest: 'create_new_table',
        }, {
          text: 'approvalTables.copy_from_template',
          icon: 'mdi-content-copy',
          value: 'copyFrom',
          disabled: true,
          dataTest: 'copy_from_template',
        }]);
      });
    });
  });

  describe('Created', () => {
    it('should fetch programs for filters', async () => {
      doMount();
      wrapper.vm.fetchPrograms = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchPrograms).toHaveBeenCalled();
    });
    it('should load state of the table', async () => {
      doMount();
      wrapper.vm.loadState = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.loadState).toHaveBeenCalled();
    });
  });
});
