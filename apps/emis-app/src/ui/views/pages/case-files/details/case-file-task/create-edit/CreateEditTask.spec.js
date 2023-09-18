import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { mockTeamEntities, mockTeamEntity, mockTeamsDataAddHoc, mockTeamsDataStandard } from '@libs/entities-lib/team';
import { mockOptionItem, mockOptionItems } from '@libs/entities-lib/optionItem';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockProvider } from '@/services/provider';
import Component from './CreateEditTask.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { teamStore } = useMockTeamStore(pinia);
const services = mockProvider();

describe('CreateEditTask.vue', () => {
  let wrapper;

  taskStore.getTaskCategories = jest.fn(() => mockOptionItems());
  teamStore.getByIds = jest.fn(() => mockTeamEntities());

  const doMount = async (shallow = true, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        id: 'mock-case-file-id-1',
      },
      data() {
        return {
          task: mockTeamTaskEntity(),
        };
      },
      computed: {
        caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
        event: () => mockEventEntity({ id: 'mock-event-id' }),
        taskNames: () => mockOptionItems(),
      },
      mocks: {
        $services: services,
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

  describe('Method', () => {
    describe('prepareCreateTask', () => {
      it('should set proper data if create team task', async () => {
        await doMount(false, {
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
          task: new TaskEntity(),
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
        expect(wrapper.vm.task).toEqual(expectedResult);
      });

      it('should set proper data if create personal task', async () => {
        await doMount(false, {
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
          task: new TaskEntity(),
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
        expectedResult.name.optionItemId = '1';
        await wrapper.vm.prepareCreateTask();
        expect(wrapper.vm.task).toEqual(expectedResult);
      });
    });

    describe('fetchEscalationTeamAndSetTeamId', () => {
      it('should call teams service getEscalationTeam and assign team id and name properly', async () => {
        await doMount(false, {
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
        wrapper.vm.$services.teams.getEscalationTeam = jest.fn(() => mockTeamEntity({ id: 'mock-id-1', name: 'mock-team-name' }));
        await wrapper.vm.fetchEscalationTeamAndSetTeamId();
        expect(wrapper.vm.$services.teams.getEscalationTeam).toHaveBeenCalledWith('mock-event-id');
        expect(wrapper.vm.task.assignedTeamId).toEqual('mock-id-1');
        expect(wrapper.vm.assignedTeamName).toEqual('mock-team-name');
      });
    });

    describe('submitCreateTask', () => {
      it('should toast an error message when creating team task without escalation team, and not call createTask', async () => {
        wrapper.vm.$toasted.global.error = jest.fn();
        taskStore.createTask = jest.fn();
        wrapper.vm.$services.teams.getEscalationTeam = jest.fn();
        await doMount(true, {
          propsData: {
            id: 'case-file-id-1',
            taskType: 'team',
          },
          data() {
            return {
              assignedTeamName: '',
              task: mockTeamTaskEntity(),
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
          task: mockTeamTaskEntity(),
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
    });

    describe('submitEditTask', () => {
      it('should call pinia store method editTask and toast message', async () => {
        taskStore.editTask = jest.fn(() => mockTeamTaskEntity());
        wrapper.vm.$toasted.global.success = jest.fn();

        await wrapper.setData({
          task: mockTeamTaskEntity(),
        });
        await wrapper.setProps({
          taskId: 'mock-task-id-1',
        });
        await wrapper.vm.submitEditTask();
        expect(taskStore.editTask).toHaveBeenCalledWith('mock-task-id-1', mockTeamTaskEntity());
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('task.task_edited');
      });
    });

    describe('submit', () => {
      it('should call submitCreateTask if isnt edit mode', async () => {
        await doMount(false, {
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
        await doMount(false, {
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
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call prepareCreateTask when isnt edit mode', async () => {
        await doMount(false, {
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
        taskStore.getTaskCategories = jest.fn();
        wrapper.vm.prepareCreateTask = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.prepareCreateTask).toHaveBeenCalled();
      });

      it('should call fetchTaskCategories', async () => {
        await doMount(false, {
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
        taskStore.fetchTaskCategories = jest.fn();
        taskStore.taskCategories = jest.fn(() => []);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(taskStore.fetchTaskCategories).toHaveBeenCalled();
      });

      it('should call fetchAssignedTeamAndSetTeamId when task type is team', async () => {
        await doMount(false, {
          propsData: {
            id: 'mock-id-1',
            taskType: 'team',
          },
          data() {
            return {
              task: mockTeamTaskEntity(),
            };
          },
          computed: {
            isEditMode: () => false,
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1', eventId: 'mock-event-id' }),
            event: () => mockEventEntity({ id: 'mock-event-id' }),
            taskNames: () => mockOptionItems(),
          },
        });
        wrapper.vm.fetchEscalationTeamAndSetTeamId = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchEscalationTeamAndSetTeamId).toHaveBeenCalled();
      });
    });
  });
});
