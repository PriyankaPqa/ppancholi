import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskActionTaken, TaskStatus } from '@libs/entities-lib/task';
import { mockProvider } from '@/services/provider';
import { mockTeamEntity, mockTeamEvents, mockTeamsDataStandard } from '@libs/entities-lib/team';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './TaskActionDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, taskStore } = useMockTaskStore();
const { teamStore } = useMockTeamStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);

describe('TaskActionDialog.vue', () => {
  let wrapper;

  const doMount = async (otherOptions = {}, shallow = true) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        show: true,
        eventId: 'mock-event-id-1',
        taskId: 'mock-task-id',
        selectedTaskCategoryName: 'mock-task-category',
        selectedSubCategoryName: 'mock-task-sub-category',
      },
      computed: {
        task: () => mockTeamTaskEntity({ id: 'mock-task-id' }),
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

    describe('task-action-dialog-team-task-info', () => {
      it('should be displayed if team task', async () => {
        await doMount();
        const element = wrapper.findDataTest('task-action-dialog-team-task-info');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be displayed if personal task', async () => {
        await doMount({
          computed: {
            task: () => mockPersonalTaskEntity(),
          },
        });
        const element = wrapper.findDataTest('task-action-dialog-team-task-info');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-action-dialog-sub-category', () => {
      it('should be displayed if there is selected category', () => {
        const element = wrapper.findDataTest('task-action-dialog-sub-category');
        expect(element.exists()).toBeTruthy();
      });

      it('should be displayed if there is no selected sub-category', async () => {
        await wrapper.setProps({
          selectedSubCategoryName: '',
        });
        const element = wrapper.findDataTest('task-action-dialog-sub-category');
        expect(element.exists()).toBeFalsy();
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
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
          },
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
        await doMount({
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
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
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(true);
      });

      it('should return false when taskType is personal', async () => {
        await wrapper.setProps({
          task: mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.TaskCompleted,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(false);
      });

      it('should return true when Reopen is picked', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.Reopen,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(true);
      });

      it('should return false actionTaken is not actions assign to a new team', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.TaskCompleted,
        });
        expect(wrapper.vm.showAssignTeamSelect).toEqual(false);
      });
    });

    describe('teamTaskCreatorInfo', () => {
      it('should return proper data', async () => {
        await doMount(true, {
          computed: {
            userAccountMetadata: () => mockUserAccountMetadata({ id: 'mock-id-1' }),
          },
        });
        expect(wrapper.vm.teamTaskCreatorInfo).toEqual('task.task_details.by Jane Smith (System Admin)');
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
          'mock-task-id',
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

    describe('getAssignableTeams', () => {
      it('should call service getTeamsByEvent event id, filter out unassigned teams and set data properly', async () => {
        teamStore.getTeamsByEvent = jest.fn(() => ([
          mockTeamsDataStandard({ id: '1', isAssignable: true }),
          mockTeamsDataStandard({ id: '2', isAssignable: false }),
        ]));
        await wrapper.setProps({
          eventId: mockTeamEvents()[0].id,
        });
        await wrapper.vm.getAssignableTeams();
        expect(teamStore.getTeamsByEvent).toHaveBeenCalledWith({ eventId: wrapper.vm.eventId });
        expect(wrapper.vm.assignableTeams).toEqual([mockTeamsDataStandard({ id: '1', isAssignable: true })]);
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
      it('should call getAssignableTeams and fetch user account metadata if taskType is team', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
        });
        await wrapper.setProps({
          eventId: 'mock-id-123',
        });
        userAccountMetadataStore.fetch = jest.fn();
        wrapper.vm.getAssignableTeams = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.getAssignableTeams).toHaveBeenCalled();
        expect(userAccountMetadataStore.fetch).toHaveBeenCalled();
      });

      it('should not call getAssignableTeams if taskType is personal', async () => {
        await doMount({
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
        });
        await wrapper.setProps({
          eventId: 'mock-id-123',
        });
        wrapper.vm.getAssignableTeams = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.getAssignableTeams).not.toHaveBeenCalled();
      });

      it('should set financialAssistancePaymentName from prop and do not call fetchSelectedFAPaymentAndSetName', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
        });
        await wrapper.setProps({
          financialAssistancePaymentNameProp: 'mock-fa-name',
        });
        wrapper.vm.fetchSelectedFAPaymentAndSetName = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.financialAssistancePaymentName).toEqual('mock-fa-name');
        expect(wrapper.vm.fetchSelectedFAPaymentAndSetName).not.toHaveBeenCalled();
      });

      it('should call fetchSelectedFAPaymentAndSetName if there is no fa name from prop, and there is financialAssistancePaymentId', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress, financialAssistancePaymentId: 'mock-fa-id-123' }),
          },
        });
        await wrapper.setProps({
          financialAssistancePaymentNameProp: '',
        });
        wrapper.vm.fetchSelectedFAPaymentAndSetName = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchSelectedFAPaymentAndSetName).toHaveBeenCalled();
      });

      it('should not call fetchSelectedFAPaymentAndSetName if there is no fa name from prop, and there is no financialAssistancePaymentId', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress, financialAssistancePaymentId: '' }),
          },
        });
        await wrapper.setProps({
          financialAssistancePaymentNameProp: '',
        });
        wrapper.vm.fetchSelectedFAPaymentAndSetName = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.fetchSelectedFAPaymentAndSetName).not.toHaveBeenCalled();
      });
    });
  });
});
