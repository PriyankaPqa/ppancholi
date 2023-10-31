import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskActionTaken, TaskStatus } from '@libs/entities-lib/task';
import { mockProvider } from '@/services/provider';
import { mockTeamEntity, mockTeamEvents } from '@libs/entities-lib/team';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import Component from './TaskActionDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, taskStore } = useMockTaskStore();

describe('TaskActionDialog.vue', () => {
  let wrapper;

  const doMount = async (otherOptions = {}, shallow = true) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        show: true,
        eventId: 'mock-event-id-1',
        task: mockTeamTaskEntity(),
      },
      mocks: {
        $services: services,
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
    describe('task-action-dialog-team-assign-to', () => {
      it('should be rendered when showAssignTeamSelect is true ', async () => {
        await doMount({
          computed: {
            showAssignTeamSelect: () => true,
          },
        });
        const element = wrapper.findDataTest('task-action-dialog-team-assign-to');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('action-radio-group', () => {
      it('should call resetFrom when change', async () => {
        await doMount(null, false);
        wrapper.vm.resetForm = jest.fn();
        const element = wrapper.findDataTest('action-radio-group');
        await element.vm.$emit('change');
        expect(wrapper.vm.resetForm).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('actionItems', () => {
      it('should return proper items when taskType is team and status is InProgress', async () => {
        await doMount();
        expect(wrapper.vm.actionItems).toEqual([
          {
            value: TaskActionTaken.Assign,
            label: 'task.task_action_dialog.Assign',
            description: 'task.task_action_dialog.Assign.description',
          },
          {
            value: TaskActionTaken.ActionCompleted,
            label: 'task.task_action_dialog.ActionCompleted',
            description: 'task.task_action_dialog.ActionCompleted.description',
          },
          {
            value: TaskActionTaken.TaskCompleted,
            label: 'task.task_action_dialog.TaskCompleted',
            description: 'task.task_action_dialog.TaskCompleted.description',
          },
        ]);
      });

      it('should return proper items status is Completed', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
        });
        expect(wrapper.vm.actionItems).toEqual([
          {
            value: TaskActionTaken.Reopen,
            label: 'task.task_action_dialog.Reopen',
            description: '',
          },
        ]);
      });

      it('should return proper items when taskType is personal', async () => {
        await wrapper.setProps({
          task: mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        expect(wrapper.vm.actionItems).toEqual([
          {
            value: TaskActionTaken.TaskCompleted,
            label: 'task.task_action_dialog.personal_task.TaskCompleted',
            description: '',
          },
        ]);
      });
    });

    describe('showAssignTeamSelect', () => {
      it('should return true when taskType is team, taskStatus is InProgress and actionTaken is actions assign to a new team', async () => {
        await doMount();
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(true);
      });

      it('should return false when taskType is personal', async () => {
        await doMount();
        await wrapper.setProps({
          task: mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.TaskCompleted,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(false);
      });

      it('should return true taskStatus is Completed', async () => {
        await doMount();
        await wrapper.setProps({
          taskType: 'team',
          taskStatus: TaskStatus.Completed,
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.Reopen,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(true);
      });

      it('should return false actionTaken is not actions assign to a new team', async () => {
        await doMount();
        await wrapper.setProps({
          taskType: 'team',
          taskStatus: TaskStatus.InProgress,
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.TaskCompleted,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      it('should not call service taskAction if form validation is false', async () => {
        taskStore.taskAction = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
          rationale: 'test-string',
        });
        await wrapper.vm.onSubmit();
        expect(taskStore.taskAction).not.toHaveBeenCalled();
      });

      it('should call service taskAction if form validation is true', async () => {
        taskStore.taskAction = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
          rationale: 'test-string',
        });
        await wrapper.vm.onSubmit();
        expect(taskStore.taskAction).toHaveBeenCalledWith(
          'mock-team-task-id-1',
          'mock-case-file-id-1',
          { actionType: TaskActionTaken.Assign, rationale: 'test-string', teamId: '' },
        );
      });

      it('should emit update:show event when received response from server', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        taskStore.taskAction = jest.fn(() => mockTeamTaskEntity());
        wrapper.vm.$emit = jest.fn();
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
          rationale: 'test-string',
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('update:show', false);
      });
    });

    describe('fetchTeamsOfEvent', () => {
      it('should call service getTeamsByEvent event id and set data properly', async () => {
        wrapper.vm.$services.teams.getTeamsByEvent = jest.fn(() => mockTeamEvents());
        await wrapper.setProps({
          eventId: mockTeamEvents()[0].id,
        });
        await wrapper.vm.fetchTeamsOfEvent();
        expect(wrapper.vm.$services.teams.getTeamsByEvent).toHaveBeenCalledWith(wrapper.vm.eventId);
        expect(wrapper.vm.teamsOfEvent).toEqual(mockTeamEvents());
      });
    });

    describe('resetForm', () => {
      it('should reset form data', async () => {
        await doMount({
          data() {
            return {
              actionTaken: TaskActionTaken.Assign,
              rationale: 'mock-string',
              assignedTeamId: mockTeamEntity(),
            };
          },
        });
        wrapper.vm.$refs.form.reset = jest.fn();
        wrapper.vm.resetForm();
        expect(wrapper.vm.rationale).toEqual('');
        expect(wrapper.vm.assignedTeamId).toEqual('');
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should call fetchTeamsOfEvent if taskType is team', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
          eventId: 'mock-id-123',
        });
        wrapper.vm.fetchTeamsOfEvent = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchTeamsOfEvent).toHaveBeenCalled();
      });

      it('should not call fetchTeamsOfEvent if taskType is personal', async () => {
        await wrapper.setProps({
          task: mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
          eventId: 'mock-id-123',
        });
        wrapper.vm.fetchTeamsOfEvent = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchTeamsOfEvent).not.toHaveBeenCalled();
      });
    });
  });
});
