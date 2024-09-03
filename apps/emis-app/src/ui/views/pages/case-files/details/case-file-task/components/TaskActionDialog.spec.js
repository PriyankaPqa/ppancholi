import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskActionTaken, TaskStatus } from '@libs/entities-lib/task';
import { mockProvider } from '@/services/provider';
import { mockTeamEntity, mockTeamsDataStandard } from '@libs/entities-lib/team';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import Component from './TaskActionDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, taskStore } = useMockTaskStore();
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const { teamStore } = useMockTeamStore(pinia);
useFinancialAssistancePaymentStore(pinia);

teamStore.getTeamsByEvent = jest.fn(() => ([
  mockTeamsDataStandard({ id: '1', isAssignable: true }),
  mockTeamsDataStandard({ id: '2', isAssignable: false }),
  mockTeamsDataStandard({ id: '3', isEscalation: true, teamMembers: [{ id: 'someone' }] }),
]));

describe('TaskActionDialog.vue', () => {
  let wrapper;

  const doMount = async (otherOptions = {}, shallow = true, level = 5) => {
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
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
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
      it('should return proper items when taskType is team and status is InProgress and user is in assigned team', async () => {
        await doMount({ computed: {
          assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          userId: () => 'user-1',
        } }, true, 5);
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

      it('should return proper items when taskType is team and status is New', async () => {
        const task = mockTeamTaskEntity({ taskStatus: TaskStatus.New });

        await doMount({ computed: { task: () => task,
          assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          userId: () => 'user-1',
        } }, true, 5);

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
        expect(wrapper.vm.actionItems.find((a) => a.value === TaskActionTaken.Cancelled)).toBeFalsy();

        await doMount({ computed: { task: () => task } }, true, 6);
        expect(wrapper.vm.actionItems.find((a) => a.value === TaskActionTaken.Cancelled)).toBeTruthy();

        await doMount({ computed: { task: () => task } }, true, 5);
        await wrapper.setData({ userIsInEscalationTeam: true });
        expect(wrapper.vm.actionItems.find((a) => a.value === TaskActionTaken.Cancelled)).toBeTruthy();

        task.createdBy = wrapper.vm.userId;
        await doMount({ computed: { task: () => task } }, true, 5);
        expect(wrapper.vm.actionItems.find((a) => a.value === TaskActionTaken.Cancelled)).toBeTruthy();
      });

      it('should only contain cancelled if user is creator but not assigned to team and status is new', async () => {
        const task = mockTeamTaskEntity({ taskStatus: TaskStatus.New });
        task.createdBy = wrapper.vm.userId;
        await doMount({ computed: { task: () => task, isInAssignedTeam: () => false } }, true, 5);
        expect(wrapper.vm.actionItems.find((a) => a.value === TaskActionTaken.Cancelled)).toBeTruthy();
        expect(wrapper.vm.actionItems.length).toBe(1);
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

      it('should return proper items status is Cancelled', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Cancelled }),
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
          {
            value: TaskActionTaken.Cancelled,
            label: 'task.task_action_dialog.Cancelled',
            description: 'task.task_action_dialog.Cancelled.description',
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
        await doMount({
          computed: {
            userAccountMetadata: () => mockUserAccountMetadata({ id: 'mock-id-1' }),
          },
        }, true);
        expect(wrapper.vm.teamTaskCreatorInfo).toEqual('task.task_details.by Jane Smith (System Admin)');
      });
    });

    describe('availableTeams', () => {
      it('should only return the escalation team when task status is cancelled', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Cancelled }),
          },
        });
        await wrapper.setData({
          assignableTeams: [mockTeamEntity({ isAssignable: true, isEscalation: true, id: 'id-1' }), mockTeamEntity({ isAssignable: true, isEscalation: false, id: 'id-2' })],
        });
        expect(wrapper.vm.availableTeams).toEqual([mockTeamEntity({ isAssignable: true, isEscalation: true, id: 'id-1' })]);
      });

      it('should return empty list if no escalation on that event when task status is cancelled', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Cancelled }),
          },
        });
        await wrapper.setData({
          assignableTeams: [mockTeamEntity({ isAssignable: true, isEscalation: false, id: 'id-1' }), mockTeamEntity({ isAssignable: true, isEscalation: false, id: 'id-2' })],
        });
        expect(wrapper.vm.availableTeams).toEqual([]);
      });

      it('should return list of teams filter out assigned team when actionTaken is not Reopen', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'id-1' }),
          },
        }, true);
        await wrapper.setData({
          actionTaken: TaskActionTaken.Assign,
          assignableTeams: [mockTeamEntity({ id: 'id-1' }), mockTeamEntity({ id: 'id-2' })],
        });
        expect(wrapper.vm.availableTeams).toEqual([mockTeamEntity({ id: 'id-2' })]);
      });

      it('should not filter out assigned team when actionTaken is Reopen', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'id-1' }),
          },
        }, true);
        await wrapper.setData({
          actionTaken: TaskActionTaken.Reopen,
          assignableTeams: [mockTeamEntity({ id: 'id-1' }), mockTeamEntity({ id: 'id-2' })],
        });
        expect(wrapper.vm.availableTeams).toEqual([mockTeamEntity({ id: 'id-1' }), mockTeamEntity({ id: 'id-2' })]);
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

      it('should call error toaster if form validation is false and task status is Canceled and availableTeams is empty', async () => {
        await doMount({
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Cancelled }),
            availableTeams: () => [],
          },
        });
        await wrapper.setData({
          actionTaken: TaskActionTaken.Reopen,
          rationale: 'test-string',
        });
        wrapper.vm.$toasted.global.error = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalled();
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
          { actionType: TaskActionTaken.Assign, rationale: 'test-string', teamId: '', taskStatus: TaskStatus.InProgress },
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
