import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import {
  mockPersonalTaskEntity,
  mockTaskMetadata,
  mockTeamTaskEntity,
  TaskStatus,
  TaskType,
} from '@libs/entities-lib/task';
import { mockOptionItem, mockOptionItems } from '@libs/entities-lib/optionItem';
import { mockProvider } from '@/services/provider';
import routes from '@/constants/routes';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import { EFilterType } from '@libs/component-lib/types';
import helpers from '@/ui/helpers/helpers';
import { RcAddButtonWithMenu, RcDataTable } from '@libs/component-lib/components';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { Status } from '@libs/entities-lib/base';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import Component from './TasksTable.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userStore } = useMockUserStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const services = mockProvider();
taskStore.getTaskName = jest.fn(() => mockOptionItems());
userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata());
userStore.getUserId = jest.fn(() => 'user-1');

describe('TasksTable.vue', () => {
  let wrapper;
  const doMount = async (otherOptions = {}, shallow = true, level = 5) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        id: 'mock-case-file-id-1',
      },
      data() {
        return {
          personalTaskOnly: false,
          teamTaskOnly: false,
          hasActiveToggle: false,
          options: {
            page: 1,
            sortBy: ['Entity/DateAdded'],
            sortDesc: [true],
          },
          params: { orderBy: 'asc' },
        };
      },
      computed: {
        parsedTableData: () => [{
          entity: mockTeamTaskEntity({
            id: '1',
            assignedTeamId: 'mock-team-id-1',
            assignedTeamName: 'mock-team-name',
            category: {
              displayName: {
                translation: {
                  en: 'case worker 2',
                  fr: 'case worker 2 fr',
                },
              },
              optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
              specifiedOther: '',
            },
          }),
          metadata: mockTaskMetadata({ id: '1' }),
          pinned: false,
        }],

        personalTaskOnlyFilter() {
          return {
            or: {
              Entity: {
                TaskType: {
                  [ITEM_ROOT]: TaskType.Personal,
                },
                CreatedBy: {
                  [ITEM_ROOT]: 'mock-user-id',
                },
              },
            },
          };
        },

        teamTaskOnlyFilter() {
          return {
            or: [
              { Entity: {
                AssignedTeamId: 'id',
              },
              }],
          };
        },
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('data table', () => {
      let dataTable;
      beforeEach(() => {
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists())
          .toBeTruthy();
      });
    });

    describe('filter-toolbar', () => {
      it('should call fetchEventsFilter when open and is not in Case file', async () => {
        await doMount({
          propsData: {
            isInCaseFile: false,
          },
        }, false);
        wrapper.vm.fetchEventsFilter = jest.fn();
        const component = wrapper.findComponent(FilterToolbar);
        await component.vm.$emit('open');
        expect(wrapper.vm.fetchEventsFilter).toHaveBeenCalled();
      });

      it('should not call fetchEventsFilter when open and is in Case file', async () => {
        jest.clearAllMocks();
        await doMount({
          propsData: {
            isInCaseFile: true,
          },
        }, false);
        wrapper.vm.fetchEventsFilter = jest.fn();
        const component = wrapper.findComponent(FilterToolbar);
        await component.vm.$emit('open');
        expect(wrapper.vm.fetchEventsFilter).not.toHaveBeenCalled();
      });
    });

    describe('task-table-create-task-button', () => {
      it('should be rendered when is in Case File', async () => {
        await doMount({
          propsData: {
            id: '1',
            isInCaseFile: true,
          },
        }, false);
        const element = wrapper.findComponent(RcAddButtonWithMenu);
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('task-table-personal-task-switch', () => {
      it('should be rendered', async () => {
        await doMount();
        const element = wrapper.findDataTest('task-table-personal-task-switch');
        expect(element.exists()).toBeTruthy();
      });

      it('should call onPersonalTaskToggleChange', async () => {
        wrapper.vm.onPersonalTaskToggleChange = jest.fn();
        const element = wrapper.findDataTest('task-table-personal-task-switch');
        await element.vm.$emit('change', true);
        expect(wrapper.vm.onPersonalTaskToggleChange).toHaveBeenCalledWith(true);
        await element.vm.$emit('change', false);
        expect(wrapper.vm.onPersonalTaskToggleChange).toHaveBeenCalledWith(false);
      });
    });

    describe('task-table-team-task-switch', () => {
      it('should be rendered', async () => {
        await doMount({}, false);
        const element = wrapper.findDataTest('task-table-team-task-switch');
        expect(element.exists()).toBeTruthy();
      });

      it('should call onTeamTaskToggleChange', async () => {
        wrapper.vm.onTeamTaskToggleChange = jest.fn();
        const element = wrapper.findDataTest('task-table-team-task-switch');
        await element.vm.$emit('change', true);
        expect(wrapper.vm.onTeamTaskToggleChange).toHaveBeenCalledWith(true);
        await element.vm.$emit('change', false);
        expect(wrapper.vm.onTeamTaskToggleChange).toHaveBeenCalledWith(false);
      });
    });

    describe('task-table-task-status', () => {
      it('should be rendered for team task', async () => {
        await doMount({}, false);
        const element = wrapper.findDataTest('task-table-task-status');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered for in progress personal task', async () => {
        await doMount({
          computed: {
            tableData: () => [
              {
                entity: mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
                metadata: mockTaskMetadata(),
              },
            ],
          },
        }, false);
        const element = wrapper.findDataTest('task-table-task-status');
        expect(element.exists()).toBeFalsy();
      });

      it('should not be rendered for completed personal task', async () => {
        await doMount({
          computed: {
            parsedTableData: () => [
              {
                entity: mockPersonalTaskEntity({ taskStatus: TaskStatus.Completed }),
                metadata: mockTaskMetadata(),
              },
            ],
          },
        }, false);
        const element = wrapper.findDataTest('task-table-task-status');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('task-table-date-added', () => {
      it('should be rendered', async () => {
        await doMount({}, false);
        const element = wrapper.findDataTest('task-table-date-added');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('task-table-task-name', () => {
      it('should be rendered', async () => {
        await doMount({}, false);
        const element = wrapper.findDataTest('task-table-task-name');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('task-table-case-file-number-link', () => {
      it('should be rendered when is not in case file', async () => {
        await doMount({
          propsData: {
            isInCaseFile: false,
          },
        }, false);
        const element = wrapper.findDataTest('task-table-case-file-number-link');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when is in case file', async () => {
        await doMount({
          propsData: {
            isInCaseFile: true,
          },
        }, false);
        const element = wrapper.findDataTest('task-table-case-file-number-link');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('labels', () => {
      it('should return proper data if is in case file', async () => {
        await wrapper.setProps({
          isInCaseFile: true,
        });
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'task.table_title',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });

      it('should return proper data if is not in case file', async () => {
        await wrapper.setData({
          itemsCount: 10,
        });
        await wrapper.setProps({
          isInCaseFile: false,
        });
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'task.table_title (10)',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('tableProps', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(taskStore.searchLoading);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
        expect(wrapper.vm.tableProps.itemKey).toEqual('entity.id');
        expect(wrapper.vm.tableProps.showExpand).toEqual(wrapper.vm.isInCaseFile);
      });
    });

    describe('customColumns', () => {
      it('should return proper data when is in case File', () => {
        expect(wrapper.vm.customColumns).toEqual({
          taskName: 'Metadata/Name/Translation/en',
          taskCategory: 'Metadata/TaskCategoryName/Translation/en',
          assignTo: 'Metadata/AssignedTeamName',
          caseFileNumber: 'Metadata/CaseFileNumber',
          isUrgent: 'Entity/IsUrgent',
          dateAdded: 'Entity/DateAdded',
          taskStatus: 'Entity/TaskStatus',
          action: 'action',
          edit: 'edit',
        });
      });
    });

    describe('headers', () => {
      it('should return proper data when is in case file', async () => {
        await wrapper.setProps({
          isInCaseFile: true,
        });
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'task.task_table_header.task',
            sortable: true,
            value: wrapper.vm.customColumns.taskName,
            width: '25%',
          },
          {
            sortable: true,
            text: 'task.task_table_header.category',
            value: 'Metadata/TaskCategoryName/Translation/en',
            width: '15%',
          },
          {
            sortable: true,
            text: 'task.task_table_header.assigned_to',
            value: 'Metadata/AssignedTeamName',
            width: '15%',
          },
          {
            text: 'task.task_table_header.priority',
            sortable: true,
            value: wrapper.vm.customColumns.isUrgent,
            width: '10%',
          },
          {
            text: 'task.task_table_header.date_added',
            sortable: true,
            value: wrapper.vm.customColumns.dateAdded,
            width: '10%',

          },
          {
            text: 'task.task_table_header.status',
            sortable: true,
            value: wrapper.vm.customColumns.taskStatus,
            width: '10%',

          },
          {
            text: 'task.action',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.action,
            width: '2%',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.edit,
            width: '2%',
          },
        ]);
      });

      it('should return proper data when is not in case file', async () => {
        await wrapper.setProps({
          isInCaseFile: false,
        });
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'task.task_table_header.task',
            sortable: true,
            value: wrapper.vm.customColumns.taskName,
            width: '20%',
          },
          {
            sortable: true,
            text: 'task.task_table_header.category',
            value: 'Metadata/TaskCategoryName/Translation/en',
            width: '15%',
          },

          {
            sortable: true,
            text: 'task.task_table_header.assigned_to',
            value: 'Metadata/AssignedTeamName',
            width: '15%',
          },
          {
            text: 'task.task_table_header.case_file_number',
            sortable: true,
            value: wrapper.vm.customColumns.caseFileNumber,
            width: '15%',
          },
          {
            text: 'task.task_table_header.priority',
            sortable: true,
            value: wrapper.vm.customColumns.isUrgent,
            width: '10%',
          },
          {
            text: 'task.task_table_header.date_added',
            sortable: true,
            value: wrapper.vm.customColumns.dateAdded,
            width: '10%',
          },
          {
            text: 'task.task_table_header.status',
            sortable: true,
            value: wrapper.vm.customColumns.taskStatus,
            width: '10%',

          },
          {
            text: 'task.action',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.action,
            width: '2%',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.edit,
            width: '2%',
          },
        ]);
      });
    });

    describe('filterOptions', () => {
      it('should return proper data when is in Case file, including inactive task name', async () => {
        await wrapper.setProps({
          isInCaseFile: true,
        });
        taskStore.getTaskName = jest.fn(() => [mockOptionItem(), mockOptionItem({
          name: {
            translation: {
              en: 'Fire',
              fr: 'Fue',
            },
          },
          status: Status.Inactive,
        })]);
        const priorityItems = [
          { text: 'common.yes', value: true },
          { text: 'common.no', value: false },
        ];
        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: 'Entity/Name/OptionItemId',
            type: EFilterType.MultiSelect,
            label: 'task.create_edit.task_name',
            items: [
              {
                text: 'Flood',
                value: '1',
              },
              {
                text: 'Fire',
                value: '1',
              },
            ],
          },
          {
            key: 'Entity/DateAdded',
            type: EFilterType.Date,
            label: 'task.task_table_header.date_added',
          },
          {
            key: 'Entity/IsUrgent',
            type: EFilterType.Select,
            label: 'task.task_table_header.priority',
            items: priorityItems,
          },
          {
            key: 'Entity/TaskStatus',
            type: EFilterType.MultiSelect,
            label: 'task.task_table_header.status',
            items: helpers.enumToTranslatedCollection(TaskStatus, 'task.task_status'),
          },
        ]);
      });

      it('should return proper data with event filter when is not in Case file', async () => {
        await wrapper.setProps({
          isInCaseFile: false,
        });
        taskStore.getTaskName = jest.fn(() => mockOptionItems());
        const priorityItems = [
          { text: 'common.yes', value: true },
          { text: 'common.no', value: false },
        ];
        expect(wrapper.vm.filterOptions).toEqual([
          {
            disabled: false,
            items: [],
            key: 'Metadata/EventId',
            label: 'caseFileTable.filters.eventName',
            loading: false,
            props: {
              'no-data-text': 'common.inputs.start_typing_to_search',
              'no-filter': true,
              placeholder: 'common.filters.autocomplete.placeholder',
              'return-object': true,
              'search-input': null,
            },
            type: 'select',
          },
          {
            key: 'Entity/Name/OptionItemId',
            type: EFilterType.MultiSelect,
            label: 'task.create_edit.task_name',
            items: [{
              text: 'Flood',
              value: '1',
            }],
          },
          {
            key: 'Entity/DateAdded',
            type: EFilterType.Date,
            label: 'task.task_table_header.date_added',
          },
          {
            key: 'Entity/IsUrgent',
            type: EFilterType.Select,
            label: 'task.task_table_header.priority',
            items: priorityItems,
          },
          {
            key: 'Entity/TaskStatus',
            type: EFilterType.MultiSelect,
            label: 'task.task_table_header.status',
            items: helpers.enumToTranslatedCollection(TaskStatus, 'task.task_status'),
          },
        ]);
      });
    });

    describe('menuItems', () => {
      it('should return proper data', async () => {
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'task.create.new_personal_task',
          value: 'personal',
          dataTest: 'create-personal-task-link',
        }, {
          text: 'task.create.new_team_task',
          value: 'team',
          dataTest: 'create-team-task-link',
        }]);
      });
    });

    describe('personalTaskOnlyFilter', () => {
      it('should return correct filter object', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        expect(wrapper.vm.personalTaskOnlyFilter).toEqual({
          or: {
            Entity: {
              TaskType: {
                [ITEM_ROOT]: TaskType.Personal,
              },
              CreatedBy: {
                [ITEM_ROOT]: wrapper.vm.userId,
              },
            },
          },
        });
      });
    });

    describe('teamTaskOnlyFilter', () => {
      it('should return correct filter object based on userAccountMetadata', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        expect(wrapper.vm.teamTaskOnlyFilter).toEqual({
          or: {
            Entity: {
              AssignedTeamId: { searchIn_az: ['team-mock-id'] },
            },
          },
        });
      });
    });
  });

  describe('Methods', () => {
    describe('applyCustomFilter', () => {
      describe('when value is True', () => {
        it('should call onApplyFilter with filters from the panel + filter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const expected = { preparedFilters: { ...wrapper.vm.userFilters, ...wrapper.vm.personalTaskOnlyFilter }, searchFilters: wrapper.vm.userSearchFilters };

          await wrapper.vm.applyCustomFilter(true, wrapper.vm.personalTaskOnlyFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenCalledWith(expected, null);
        });

        it('should should clean up existing toggle filter value before generation a new filter object', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            userFilters: {
              and: {
                Entity: {
                  MockKey: 'MockValue',
                },
              },
              or: {
                Entity: {
                  MockKeyToBeRemove: 'MockValueToBeRemove',
                },
              },
            },
          });
          const userFiltersAfterCleanUp = {
            and: {
              Entity: {
                MockKey: 'MockValue',
              },
            },
          };
          const expected = { preparedFilters: { ...userFiltersAfterCleanUp, ...wrapper.vm.personalTaskOnlyFilter }, searchFilters: wrapper.vm.userSearchFilters };
          await wrapper.vm.applyCustomFilter(true, wrapper.vm.personalTaskOnlyFilter);
          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenCalledWith(expected, null);
        });
      });

      describe('when value is False', () => {
        it('should call onApplyFilter with {} if the only filter is the applied filter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.vm.applyCustomFilter(false, wrapper.vm.personalTaskOnlyFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: {}, searchFilters: wrapper.vm.userSearchFilters }, null);
        });

        it('should call onApplyFilter with filters from the panel if present', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const filterFromPanel = {
            test: {},
          };
          await wrapper.setData({
            userFilters: {
              ...wrapper.vm.personalTaskOnlyFilter,
              ...filterFromPanel,
            },
          });
          await wrapper.vm.applyCustomFilter(false, wrapper.vm.personalTaskOnlyFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: filterFromPanel, searchFilters: wrapper.vm.userSearchFilters }, null);
        });
      });
    });

    describe('goToCreateTask', () => {
      it('should call $router push with proper name and params', async () => {
        wrapper.vm.goToCreateTask({ value: 'team' });
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.task.create.name,
          params: {
            taskType: 'team',
            id: 'mock-case-file-id-1',
          },
        });
      });
    });

    describe('getTaskDetailsRoute', () => {
      it('should return proper router object', () => {
        expect(wrapper.vm.getTaskDetailsRoute('mock-case-file-1', 'mock-task-id-1')).toEqual({
          name: routes.caseFile.task.details.name,
          params: {
            taskId: 'mock-task-id-1',
            id: 'mock-case-file-1',
          },
        });
      });
    });

    describe('canEdit', () => {
      it('should be true when user has Level6', async () => {
        await doMount({
          pinia: getPiniaForUser(UserRoles.level6),
        });
        const taskEntity = mockTeamTaskEntity();
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(true);
      });

      it('should be true when task type is personal and user is the creator', async () => {
        const taskEntity = mockPersonalTaskEntity({ createdBy: 'user-1' });
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(true);
      });

      it('should be true when task type is team, status is InProgress and user has no L1 but is creator', async () => {
        await doMount({
          pinia: getPiniaForUser(UserRoles.level0),
        });
        const taskEntity = mockTeamTaskEntity({ createdBy: 'user-1' });
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(true);
      });

      it('should be false if task is Completed and user has no L6', async () => {
        await doMount({
          pinia: getPiniaForUser(UserRoles.level1),
        });
        const taskEntity = mockTeamTaskEntity({ taskStatus: TaskStatus.Completed });
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(false);
      });

      it('should be true when task type is team, status is InProgress and user has L1', async () => {
        await doMount({}, true, 1);
        const taskEntity = mockTeamTaskEntity({ createdBy: 'user-2' });
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(true);
      });

      it('should be false if task is Completed and user has no L6 and user is the creator', async () => {
        await doMount({
          pinia: getPiniaForUser(UserRoles.level1),
        });
        const taskEntity = mockTeamTaskEntity({ taskStatus: TaskStatus.Completed, createdBy: 'user-1' });
        expect(wrapper.vm.canEdit(taskEntity)).toEqual(false);
      });
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query',
          filter: { caseFileId: 'filter' },
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        wrapper.vm.combinedTaskStore.search = jest.fn();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedTaskStore.search)
          .toHaveBeenCalledWith({
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

      it('should call storage actions with proper parameters when is in case file', async () => {
        await wrapper.setProps({
          isInCaseFile: true,
        });
        wrapper.vm.combinedTaskStore.search = jest.fn();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedTaskStore.search)
          .toHaveBeenCalledWith({
            search: params.search,
            filter: { caseFileId: 'filter', ...params.filter },
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          });
      });
    });

    describe('onApplyFilterLocal', () => {
      describe('when user is using my personal task filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            personalTaskOnly: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.personalTaskOnlyFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is not using my personal task filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            personalTaskOnly: false,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is using my team task filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            teamTaskOnly: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.teamTaskOnlyFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is not using my team task filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            teamTaskOnly: false,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });
    });

    describe('getEditTaskRoute', () => {
      it('should call $router push with proper object', () => {
        wrapper.vm.getEditTaskRoute(mockTeamTaskEntity());
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: 'casefile.task.edit',
          params: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-team-task-id-1',
            taskType: 'team',
          },
        });
      });
    });

    describe('setActioningTask', () => {
      it('should set actioning task and event id properly', async () => {
        await wrapper.setData({
          actioningTask: null,
          actioningEventId: '',
        });
        const item = {
          entity: mockTeamTaskEntity(),
          metadata: mockTaskMetadata(),
        };
        wrapper.vm.setActioningTask(item);
        expect(wrapper.vm.actioningTask).toEqual(mockTeamTaskEntity());
        expect(wrapper.vm.actioningEventId).toEqual('mock-event-id-1');
      });
    });

    describe('onTeamTaskToggleChange', () => {
      it('should call applyCustomFilter with correct params and set personalTaskOnly to false', async () => {
        await doMount({
          data() {
            return {
              personalTaskOnly: true,
              params: { orderBy: 'asc' },
            };
          },
        });
        wrapper.vm.applyCustomFilter = jest.fn();
        wrapper.vm.onTeamTaskToggleChange(true);
        expect(wrapper.vm.personalTaskOnly).toEqual(false);
        expect(wrapper.vm.applyCustomFilter).toHaveBeenCalledWith(true, wrapper.vm.teamTaskOnlyFilter);
      });
    });

    describe('onPersonalTaskToggleChange', () => {
      it('should call applyCustomFilter with correct params and set teamTaskOnly to false', async () => {
        await doMount({
          data() {
            return {
              teamTaskOnly: true,
              params: { orderBy: 'asc' },
            };
          },
        });
        wrapper.vm.applyCustomFilter = jest.fn();
        wrapper.vm.onPersonalTaskToggleChange(true);
        expect(wrapper.vm.teamTaskOnly).toEqual(false);
        expect(wrapper.vm.applyCustomFilter).toHaveBeenCalledWith(true, wrapper.vm.personalTaskOnlyFilter);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe('created', () => {
      it('should call services fetch data when is in case file', async () => {
        await doMount({
          propsData: {
            isInCaseFile: true,
          },
          data() {
            return {
              options: {
                page: 1,
                sortBy: ['Entity/DateAdded'],
                sortDesc: [true],
              },
            };
          },
        });
        wrapper.vm.search = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        const options = mockOptionItems();
        taskStore.getTaskName = jest.fn(() => options);
      });

      it('should set saveState to ture and call loadState', async () => {
        await doMount();
        wrapper.vm.loadState = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.saveState).toEqual(true);
        expect(wrapper.vm.loadState).toHaveBeenCalled();
      });
    });
  });
});
