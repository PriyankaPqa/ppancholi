import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { mockTeamEntities, mockTeamEntity, mockTeamsDataAddHoc, mockTeamsDataStandard } from '@libs/entities-lib/team';
import { mockOptionItem, mockOptionItems } from '@libs/entities-lib/optionItem';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import routes from '@/constants/routes';
import { mockProvider } from '@/services/provider';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import Component from './CreateEditTask.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { teamStore } = useMockTeamStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const { userStore } = useMockUserStore(pinia);
const services = mockProvider();

describe('CreateEditTask.vue', () => {
  let wrapper;

  taskStore.getTaskName = jest.fn(() => mockOptionItems());
  teamStore.getByIds = jest.fn(() => mockTeamEntities());

  const doMount = async (shallow = true, otherOptions = {}, level = 6) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        id: 'mock-case-file-id-1',
      },
      data() {
        return {
          localTask: mockTeamTaskEntity(),
          assignedTeam: mockTeamEntity(),
        };
      },
      computed: {
        caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
        event: () => mockEventEntity({ id: 'mock-event-id' }),
        taskNames: () => mockOptionItems(),
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, option) : mount(Component, option);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('opens the dialog if change is detected in edit mode', async () => {
      await doMount(true, {
        computed: {
          isDirty: () => true,
          isEditMode: () => true,
          caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
          event: () => mockEventEntity({ id: 'mock-event-id' }),
          taskNames: () => mockOptionItems(),
        },
      });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
    });

    it('calls next in edit mode if the confirmation dialog returns true', async () => {
      await doMount(false, {
        computed: {
          isDirty: () => true,
          isEditMode: () => true,
          caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
          event: () => mockEventEntity({ id: 'mock-event-id' }),
          taskNames: () => mockOptionItems(),
        },
      });
      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('calls next if is not in edit mode', async () => {
      await doMount(false, {
        computed: {
          isDirty: () => false,
          isEditMode: () => false,
          caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
          event: () => mockEventEntity({ id: 'mock-event-id' }),
          taskNames: () => mockOptionItems(),
        },
      });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });
  });

  describe('Computed', () => {
    describe('submitLabel', () => {
      it('should return save when is edit mode', async () => {
        await doMount(true, {
          computed: {
            isEditMode: () => true,
          },
        });
        expect(wrapper.vm.submitLabel).toEqual('common.save');
      });

      it('should return create when is edit mode', async () => {
        await doMount(true, {
          computed: {
            isEditMode: () => false,
          },
        });
        expect(wrapper.vm.submitLabel).toEqual('common.buttons.create');
      });
    });

    describe('isDirty', () => {
      it('should return false if original form data is same as the current form', async () => {
        await wrapper.setData({
          originalForm: {
            name: {
              optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
              specifiedOther: '',
            },
            category: {
              optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
              specifiedOther: '',
            },
            isUrgent: false,
            dueDate: '',
            description: 'mock-description',
          },
          localTask: mockTeamTaskEntity(),
        });
        expect(wrapper.vm.isDirty).toEqual(false);
      });

      it('should return true if original form data is not same as the current form', async () => {
        await wrapper.setData({
          originalForm: {
            name: {
              optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
              specifiedOther: '',
            },
            category: {
              optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
              specifiedOther: '',
            },
            isUrgent: false,
            dueDate: '',
            description: 'mock-description',
          },
          localTask: mockTeamTaskEntity({
            description: 'new-description',
          }),
        });
        expect(wrapper.vm.isDirty).toEqual(true);
      });
    });

    describe('assignedToPerson', () => {
      it('should render assigned to me when user is creator', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
          },
        });

        await flushPromises();
        userStore.getUserId = jest.fn(() => 'mock-user-1');

        expect(wrapper.vm.assignedToPerson).toEqual('task.create_edit.assigned_to.me');
      });

      it('should return the name of creator when user is not creator and user has level6', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-2');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
          },
        }, 6);
        await flushPromises();
        expect(wrapper.vm.assignedToPerson).toEqual('Jane Smith');
      });
    });

    describe('displayWorkingOnIt', () => {
      it('should be true when task is in progress and is edit mode', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
            isEditMode: () => true,
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(true);
      });

      it('should be true when task is new and is edit mode', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.New }),
            isEditMode: () => true,
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(true);
      });

      it('should be false when task is completed', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
          isEditMode: () => true,
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(false);
      });

      it('should be false when is not edit mode', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
          isEditMode: () => false,
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(false);
      });

      it('should be false when is personal task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
            isEditMode: () => true,
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(false);
      });
    });
  });

  describe('Method', () => {
    describe('prepareCreateTask', () => {
      it('should set proper data if create team task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskType: 'team',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        await wrapper.setData({
          localTask: new TaskEntity(),
        });
        teamStore.getByIds = jest.fn(() => [
          mockTeamsDataStandard({ isEscalation: false }),
          mockTeamsDataAddHoc({ isEscalation: true, id: 'mock-team-id-1' }),
        ]);
        const expectedResult = new TaskEntity();
        expectedResult.taskType = TaskType.Team;
        expectedResult.taskStatus = TaskStatus.InProgress;
        expectedResult.caseFileId = 'mock-case-file-id-1';
        expectedResult.assignedTeamId = '';
        await wrapper.vm.prepareCreateTask();
        expect(wrapper.vm.localTask).toEqual(expectedResult);
      });

      it('should set proper data if create personal task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskType: 'personal',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => [mockOptionItem({ id: '1', isOther: true, subitems: [] }), mockOptionItem({ id: '2' })],
          },
        });
        await wrapper.setData({
          localTask: new TaskEntity(),
        });
        const expectedResult = new TaskEntity();
        expectedResult.taskType = TaskType.Personal;
        expectedResult.taskStatus = TaskStatus.InProgress;
        expectedResult.caseFileId = 'mock-case-file-id-1';
        expectedResult.assignedTeamId = '';
        expectedResult.category = {
          optionItemId: null,
          specifiedOther: null,
        };
        await wrapper.vm.prepareCreateTask();
        expect(wrapper.vm.localTask).toEqual(expectedResult);
      });
    });

    describe('fetchAssignedTeamAndSetTeamId', () => {
      it('should call teams service getTeamsByEvent and assign team id and name properly when it is not edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskType: 'team',
          },
          computed: {
            isEditMode: () => false,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.$services.teams.getTeamsByEvent = jest.fn(() => [
          mockTeamEntity({ id: 'mock-id-1', name: 'mock-team-name-1', isEscalation: true }),
          mockTeamEntity({ id: 'mock-id-2', name: 'mock-team-name-2', isEscalation: false }),
        ]);
        await wrapper.vm.fetchAssignedTeamAndSetTeamId();
        expect(wrapper.vm.$services.teams.getTeamsByEvent).toHaveBeenCalledWith('mock-event-id');
        expect(wrapper.vm.localTask.assignedTeamId).toEqual('mock-id-1');
        expect(wrapper.vm.assignedTeam).toEqual(mockTeamEntity({ id: 'mock-id-1', name: 'mock-team-name-1', isEscalation: true }));
      });

      it('should call teams service getTeamsByEvent and assign team id and name properly when it is edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskType: 'team',
          },
          computed: {
            isEditMode: () => true,
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-id-2' }),
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.$services.teams.getTeamsByEvent = jest.fn(() => [
          mockTeamEntity({ id: 'mock-team-id-2', name: 'mock-team-name-2', isEscalation: false }),
        ]);
        await wrapper.vm.fetchAssignedTeamAndSetTeamId();
        expect(wrapper.vm.$services.teams.getTeamsByEvent).toHaveBeenCalledWith('mock-event-id', 'mock-team-id-2');
        expect(wrapper.vm.localTask.assignedTeamId).toEqual('mock-team-id-2');
        expect(wrapper.vm.assignedTeam).toEqual(mockTeamEntity({ id: 'mock-team-id-2', name: 'mock-team-name-2', isEscalation: false }));
      });
    });

    describe('submitCreateTask', () => {
      it('should toast an error message when creating team task without escalation team, and not call createTask', async () => {
        wrapper.vm.$toasted.global.error = jest.fn();
        taskStore.createTask = jest.fn();
        await doMount(true, {
          propsData: {
            id: 'case-file-id-1',
            taskType: 'team',
          },
          data() {
            return {
              assignedTeamName: '',
              localTask: mockTeamTaskEntity(),
            };
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            isEditMode: () => false,
            taskNames: () => [mockOptionItem({ id: '1', isOther: true }), mockOptionItem({ id: '2' })],
          },
        });
        wrapper.vm.task.assignedTeamId = '';
        await flushPromises();

        await wrapper.vm.submitCreateTask();
        expect(taskStore.createTask).not.toHaveBeenCalled();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('task.error.escalation_team_is_not_available_for_the_event');
      });

      it('should call pinia store method createTask', async () => {
        taskStore.createTask = jest.fn();
        await wrapper.setData({
          localTask: mockTeamTaskEntity(),
        });
        await wrapper.vm.submitCreateTask();
        expect(taskStore.createTask).toHaveBeenCalledWith(mockTeamTaskEntity());
      });

      it('should toast different message based on taskType', async () => {
        taskStore.createTask = jest.fn(() => mockTeamTaskEntity());
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.vm.submitCreateTask();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('task.team_task_created');

        taskStore.createTask = jest.fn(() => mockPersonalTaskEntity());
        await wrapper.vm.submitCreateTask();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('task.personal_task_created');
      });

      it('should replace router with proper path and params', async () => {
        taskStore.createTask = jest.fn(() => mockTeamTaskEntity({ id: 'mock-task-id-1' }));
        wrapper.vm.$router.replace = jest.fn();
        await wrapper.vm.submitCreateTask();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.caseFile.task.details.name, params: { taskId: 'mock-task-id-1' } });
      });
    });

    describe('submitEditTask', () => {
      it('should call pinia store method editTask and toast message', async () => {
        taskStore.editTask = jest.fn(() => mockTeamTaskEntity());
        wrapper.vm.$toasted.global.success = jest.fn();

        await wrapper.setData({
          localTask: mockTeamTaskEntity(),
        });
        await wrapper.setProps({
          taskId: 'mock-task-id-1',
        });
        await wrapper.vm.submitEditTask();
        expect(taskStore.editTask).toHaveBeenCalledWith('mock-task-id-1', mockTeamTaskEntity());
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('task.task_edited');
      });

      it('should replace router with proper path and params', async () => {
        taskStore.editTask = jest.fn(() => mockTeamTaskEntity({ id: 'mock-task-id-1' }));
        wrapper.vm.$router.replace = jest.fn();
        await wrapper.vm.submitEditTask();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.caseFile.task.details.name, params: { taskId: 'mock-task-id-1' } });
      });
    });

    describe('submit', () => {
      it('should call submitCreateTask if isnt edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          computed: {
            isEditTeamTask: () => false,
            isEditMode: () => false,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.submitCreateTask = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.submitCreateTask).toHaveBeenCalled();
      });

      it('should call submitEditTask if is edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          computed: {
            isEditTeamTask: () => true,
            isEditMode: () => true,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.submitEditTask = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.submitEditTask).toHaveBeenCalled();
      });
    });

    describe('setOriginalData', () => {
      it('should set originalForm properly', async () => {
        await wrapper.setData({
          localTask: mockTeamTaskEntity(),
        });
        wrapper.vm.setOriginalData();
        expect(wrapper.vm.originalForm).toEqual({
          category: {
            optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
            specifiedOther: '',
          },
          description: 'mock-description',
          dueDate: '',
          isUrgent: false,
          name: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
            specifiedOther: '',
          },
        });
      });
    });

    describe('loadTask', () => {
      it('should fetch task properly', async () => {
        taskStore.fetch = jest.fn();
        await wrapper.setProps({
          taskId: 'mock-task-id-1',
          id: 'mock-case-file-id-1',
        });
        await wrapper.vm.loadTask();
        expect(taskStore.fetch).toHaveBeenCalledWith({
          caseFileId: 'mock-case-file-id-1',
          id: 'mock-task-id-1',
        });
      });

      it('should store task locally', async () => {
        jest.clearAllMocks();
        taskStore.fetch = jest.fn(() => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }));
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }));
        await doMount(true, {
          propsData: {
            taskId: 'mock-task-id-1',
            id: 'mock-case-file-id-1',
            taskType: 'team',
          },
          computed: {
            isEditMode: () => true,
            task: () => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }),
          },
        });
        await wrapper.vm.loadTask();
        expect(wrapper.vm.localTask).toEqual(mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }));
      });

      it('should set isWorkingOn properly and call useUserAccountMetadataStore fetch if there is user working on when is team task', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          propsData: {
            taskId: 'mock-task-id-1',
            id: 'mock-case-file-id-1',
            taskType: 'team',
          },
          computed: {
            isEditMode: () => true,
            task: () => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }),
          },
        });
        taskStore.fetch = jest.fn(() => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }));
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }));
        userAccountMetadataStore.fetch = jest.fn();
        await wrapper.vm.loadTask();
        await flushPromises();
        expect(wrapper.vm.isWorkingOn).toEqual(true);
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-1', false);
      });

      it('should set call useUserAccountMetadataStore fetch if user is not the creator when is personal task', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          propsData: {
            taskId: 'mock-task-id-1',
            id: 'mock-case-file-id-1',
            taskType: 'personal',
          },
          computed: {
            isEditMode: () => true,
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-id-1' }),
          },
        });
        taskStore.fetch = jest.fn(() => mockPersonalTaskEntity({ createdBy: 'mock-user-id-1' }));
        taskStore.getById = jest.fn(() => mockPersonalTaskEntity({ createdBy: 'mock-user-id-1' }));
        userAccountMetadataStore.fetch = jest.fn();
        userStore.getUserId = jest.fn(() => 'mock-user-id-2');
        await wrapper.vm.loadTask();
        await flushPromises();
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-1', false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call prepareCreateTask when isnt edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          computed: {
            isEditMode: () => false,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        taskStore.getTaskName = jest.fn();
        wrapper.vm.prepareCreateTask = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.prepareCreateTask).toHaveBeenCalled();
      });

      it('should call fetchAssignedTeamAndSetTeamId when task type is team', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          data() {
            return {
              localTask: mockTeamTaskEntity(),
            };
          },
          computed: {
            isEditMode: () => false,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.fetchAssignedTeamAndSetTeamId = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchAssignedTeamAndSetTeamId).toHaveBeenCalled();
      });

      it('should call loadTask and setOriginalData when is edit mode', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          data() {
            return {
              localTask: mockTeamTaskEntity(),
            };
          },
          computed: {
            isEditMode: () => true,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.loadTask = jest.fn();
        wrapper.vm.setOriginalData = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.loadTask).toHaveBeenCalled();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalled();
      });
    });
  });

  describe('watcher', () => {
    describe('task.userWorkingOn', () => {
      it('should update localTask userWorkingOn when changed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-case-file-id-1',
          },
          data() {
            return {
              mockTask: mockTeamTaskEntity({ userWorkingOn: null }),
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
        wrapper.vm.task = mockTeamTaskEntity({ userWorkingOn: 'user-1' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.localTask.userWorkingOn).toEqual('user-1');
      });
    });

    describe('task.taskStatus', () => {
      it('should update localTask taskStatus when changed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-case-file-id-1',
          },
          data() {
            return {
              mockTask: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
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
        wrapper.vm.task = mockTeamTaskEntity({ taskStatus: TaskStatus.Completed });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.localTask.taskStatus).toEqual(TaskStatus.Completed);
      });
    });

    describe('task.assignedTeamId', () => {
      it('should call fetchAssignedTeamAndSetTeamId and set isWorkingOn to false when changed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-case-file-id-1',
          },
          data() {
            return {
              mockTask: mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
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
        wrapper.vm.task = mockTeamTaskEntity({ assignedTeamId: 'mock-team-2' });
        wrapper.vm.fetchAssignedTeamAndSetTeamId = jest.fn();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.fetchAssignedTeamAndSetTeamId).toHaveBeenCalled();
        expect(wrapper.vm.isWorkingOn).toEqual(false);
      });
    });
  });
});
