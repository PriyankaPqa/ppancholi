import caseFileTask from '@/ui/mixins/caseFileTask';
import { mockOptionItem, mockOptionItems, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';

const Component = {
  render() {},
  mixins: [caseFileTask],
};

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userStore } = useMockUserStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
let wrapper;

describe('caseFileTask', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
    });
  });

  describe('Computed', () => {
    describe('taskNames', () => {
      it('should return proper data from store', () => {
        const options = mockOptionItems();
        taskStore.getTaskName = () => options;
        expect(wrapper.vm.taskNames).toEqual(options);
      });

      it('should get the inactive actual value item', async () => {
        const options = [mockOptionItem({ id: '1', status: Status.Active }), mockOptionItem({ id: '2', status: Status.Inactive })];
        await wrapper.setData({
          selectedTaskNameId: '2',
        });
        taskStore.getTaskName = jest.fn(() => options);
        expect(wrapper.vm.taskNames).toEqual(options);
      });
    });

    describe('taskCategories', () => {
      it('should return proper subitems', async () => {
        await wrapper.setData({
          selectedTaskNameId: '1',
        });
        const options = mockOptionItems();
        taskStore.getTaskName = jest.fn(() => options);
        const expectedRes = [mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' })];
        expect(wrapper.vm.taskCategories).toEqual(expectedRes);
      });

      it('should get the inactive actual value sub-item', async () => {
        const expectedRes = [[mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' }), mockOptionSubItem({ id: '2', status: Status.Inactive })]];
        await wrapper.setData({
          selectedTaskNameId: '1',
          selectedCategoryId: '2',
        });
        const options = mockOptionItems({ subitems: [mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' }), mockOptionSubItem({ id: '2', status: Status.Inactive })] });
        taskStore.getTaskName = jest.fn(() => options);
        taskStore.filterAndSortActiveSubItems = jest.fn(() => expectedRes);
        expect(wrapper.vm.taskCategories).toEqual(expectedRes);
      });
    });

    describe('selectedTaskName', () => {
      it('should return proper selected task name option', async () => {
        await wrapper.setData({
          selectedTaskNameId: '1',
        });
        const options = [mockOptionItem({ id: '1' }), mockOptionItem({ id: '2' })];
        taskStore.getTaskName = jest.fn(() => options);
        const expectedRes = options.filter((o) => o.id === '1')[0];
        expect(wrapper.vm.selectedTaskName).toEqual(expectedRes);
      });
    });

    describe('selectedCategory', () => {
      it('should return proper selected task category', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            taskNames: () => mockOptionItems(),
            taskCategories: () => [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }), mockOptionSubItem({ id: '2' })],
          },
        });
        await wrapper.setData({
          selectedTaskNameId: '1',
          selectedCategoryId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
        });
        expect(wrapper.vm.selectedCategory).toEqual(mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }));
      });
    });

    describe('personIsWorkingOn', () => {
      it('should return assigned user name when there is', () => {
        userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata({ id: 'mock-user-id-1', displayName: 'mock-name' }));
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }),
          },
        });
        expect(wrapper.vm.personIsWorkingOn).toEqual('mock-name (System Admin)');
      });

      it('should return N/A when there is not user working on', () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity({ userWorkingOn: null }),
          },
        });
        expect(wrapper.vm.personIsWorkingOn).toEqual('common.N/A');
      });
    });
  });

  describe('Methods', () => {
    describe('setWorkingOn', () => {
      it('should call store setWorkingOn with proper params', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-id-1');
        taskStore.setWorkingOn = jest.fn();
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity({ id: 'mock-task-id-1', caseFileId: 'mock-case-file-id-1' }),
          },
        });
        await wrapper.vm.setWorkingOn();
        expect(taskStore.setWorkingOn).toHaveBeenCalledWith('mock-task-id-1', 'mock-case-file-id-1', 'mock-user-id-1');
      });
    });

    describe('onToggleChange', () => {
      it('should call setWorkingOn when params is true', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        wrapper.vm.setWorkingOn = jest.fn();
        await wrapper.vm.onToggleChange(true);
        expect(wrapper.vm.setWorkingOn).toHaveBeenCalled();
      });

      it('should call $confirm when params is false', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        await wrapper.vm.onToggleChange(false);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'task.task_details.remove_working_on_dialog.title',
          messages: 'task.task_details.remove_working_on_dialog.content',
        });
      });

      it('should call setWorkingOn with false when $confirm is true', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.setWorkingOn = jest.fn();
        await wrapper.vm.onToggleChange(false);
        expect(wrapper.vm.setWorkingOn).toHaveBeenCalledWith(false);
      });

      it('should call reset isWorkingOn when $confirm is false', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          data() {
            return {
              isWorkingOn: false,
            };
          },
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.onToggleChange(false);
        expect(wrapper.vm.isWorkingOn).toEqual(true);
      });
    });
  });

  describe('watch', () => {
    describe('task.userWorkingOn', () => {
      it('should set isWorkingOn to false when task is assigned to the same team and userWorkingOn is falsy', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
            taskId: 'mock-case-file-id-1',
          },
          data() {
            return {
              mockTask: mockTeamTaskEntity({ assignedTeamId: 'mock-team-1', userWorkingOn: 'mock-user-id-1' }),
              isWorkingOn: true,
            };
          },
          computed: {
            task: {
              get() {
                return this.mockTask;
              },
              set(value) {
                this.mockTask = value;
              },
            },
          },
        });
        wrapper.vm.task = mockTeamTaskEntity({ assignedTeamId: 'mock-team-1', userWorkingOn: '' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isWorkingOn).toEqual(false);
      });
    });
  });
});
