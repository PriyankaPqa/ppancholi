import { createLocalVue, shallowMount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { mockTaskActionHistories } from '@libs/entities-lib/task';
import { mockTeamEntity } from '@libs/entities-lib/team';
import Component from './TaskHistoryDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('TaskHistoryDialog.vue', () => {
  const wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      show: true,
      isPersonalTask: false,
      teamsByEvent: [mockTeamEntity({ id: 'mock-team-1' }), mockTeamEntity({ id: 'mock-team-2' })],
      taskActionHistories: mockTaskActionHistories(),
    },
    mocks: {
      $services: services,
    },
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.headers).toEqual([
          {
            filterable: false,
            sortable: true,
            text: 'task.history.header.edited_by',
            value: 'userInformation.userName',
            width: '20%',
          },
          {
            filterable: false,
            sortable: true,
            text: 'task.history.header.action_taken',
            value: 'actionTaken',
            width: '30%',
          },
          {
            filterable: false,
            sortable: false,
            text: 'task.history.header.rationale',
            value: 'rationale',
            width: '35%',
          },
          {
            filterable: false,
            sortable: true,
            text: 'task.history.header.date_of_change',
            value: 'timestamp',
            width: '15%',
          },
        ]);
      });
    });

    describe('customColumns', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.customColumns).toEqual({
          userInformation: 'userInformation.userName',
          dateOfChange: 'timestamp',
          actionTaken: 'actionTaken',
          rationale: 'rationale',
        });
      });
    });
  });

  describe('Methods', () => {
    describe('generateTaskActionString', () => {
      it('should generate action string for Create properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[0])).toEqual('task.history.action_taken.created');
      });

      it('should generate action string for Assign properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[1], 'mock-team-name-1'))
          .toEqual({ key: 'task.history.action_taken.assigned', params: [{ x: 'mock-team-2', y: 'mock-team-1' }] });
      });

      it('should generate action string for ActionCompleted properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[2], 'mock-team-name-1', 'mock-team-name-2'))
          .toEqual({ key: 'task.history.action_taken.action_completed', params: [{ x: 'mock-team-3', y: 'mock-team-2' }] });
      });

      it('should generate action string for TaskCompleted properly', async () => {
        await wrapper.setProps({
          isPersonalTask: false,
        });
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[3])).toEqual(
          { key: 'task.history.action_taken.completed', params: [{ x: 'mock-user-name', y: 'mock-team-3' }] },
        );
      });

      it('should generate action string for Re-open properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[4])).toEqual({ key: 'task.history.action_taken.reopen', params: [{ x: 'mock-team-3' }] });
      });

      it('should generate action string for personal task completed properly', async () => {
        await wrapper.setProps({
          isPersonalTask: true,
        });
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[5])).toEqual('task.history.action_taken.personal_task_completed');
      });

      it('should generate action string for Cancelled personal task properly', async () => {
        await wrapper.setProps({
          isPersonalTask: true,
        });
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[6])).toEqual('task.history.action_taken.personal_task_cancelled');
      });

      it('should generate action string for Cancelled team task properly', async () => {
        await wrapper.setProps({
          isPersonalTask: false,
        });
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[6])).toEqual(
          { key: 'task.history.action_taken.cancelled', params: [{ x: 'mock-user-name', y: 'mock-team-1' }] },
        );
      });

      it('should generate action string for WorkingOn properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[7])).toEqual(
          { key: 'task.history.action_taken.working_on_it', params: [{ x: 'mock-user-name', y: 'mock-team-A' }] },
        );
      });

      it('should generate action string for no longer WorkingOn properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[8])).toEqual(
          { key: 'task.history.action_taken.no_longer_working_on_it', params: [{ x: 'mock-user-name', y: 'mock-team-A' }] },
        );
      });

      it('should generate action string for UrgentStatusTagUpdated properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[9])).toEqual(
          { key: 'task.history.action_taken.urgent_value_update', params: [{ x: 'mock-user-name', y: 'mock-team-1' }] },
        );
      });

      it('should generate action string for FinancialAssistancePaymentUpdated properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[10])).toEqual(
          { key: 'task.history.action_taken.fa_payment_update', params: [{ x: 'mock-user-name', y: 'mock-team-1', z: 'FA-payment-1' }] },
        );
      });
    });

    describe('parseTaskHistory', () => {
      it('should parse data properly', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({
          taskActionHistories: mockTaskActionHistories(),
        });
        wrapper.vm.parseTaskHistory();
        expect(wrapper.vm.parsedTaskActionHistoryData).toEqual([
          {
            actionTaken: 1,
            actionTakenString: 'task.history.action_taken.created',
            currentTeamId: 'mock-team-id-1',
            currentTeamName: 'mock-team-1',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: '',
            rationale: 'create task',
            taskStatus: 2,
            timestamp: '2023-01-01',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 2,
            actionTakenString: {
              key: 'task.history.action_taken.assigned',
              params: [
                {
                  x: 'mock-team-2',
                  y: 'mock-team-1',
                },
              ],
            },
            currentTeamId: 'mock-team-id-2',
            currentTeamName: 'mock-team-2',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: 'mock-team-id-1',
            previousTeamName: 'mock-team-1',
            rationale: 'assign task to team 2',
            taskStatus: 2,
            timestamp: '2023-01-01',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 3,
            actionTakenString: {
              key: 'task.history.action_taken.action_completed',
              params: [
                {
                  x: 'mock-team-3',
                  y: 'mock-team-2',
                },
              ],
            },
            currentTeamId: 'mock-team-id-3',
            currentTeamName: 'mock-team-3',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: 'mock-team-id-2',
            previousTeamName: 'mock-team-2',
            rationale: 'team 2 finish action, assign to team 3',
            taskStatus: 2,
            timestamp: '2023-01-02',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 3,
            actionTakenString: {
              key: 'task.history.action_taken.completed',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-3',
                },
              ],
            },
            currentTeamId: 'mock-team-id-3',
            currentTeamName: 'mock-team-3',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: 'mock-team-id-3',
            previousTeamName: 'mock-team-3',
            rationale: 'team 3 complete task',
            taskStatus: 3,
            timestamp: '2023-01-03',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 4,
            actionTakenString: {
              key: 'task.history.action_taken.reopen',
              params: [
                {
                  x: 'mock-team-3',
                },
              ],
            },
            currentTeamId: 'mock-team-id-3',
            currentTeamName: 'mock-team-3',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: 'mock-team-id-3',
            previousTeamName: 'mock-team-3',
            rationale: 'team 3 re-open task',
            taskStatus: 2,
            timestamp: '2023-01-04',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 3,
            actionTakenString: {
              key: 'task.history.action_taken.completed',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-A',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task completed',
            taskStatus: 3,
            timestamp: '2023-01-05',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 5,
            actionTakenString: {
              key: 'task.history.action_taken.cancelled',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-1',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task cancelled',
            taskStatus: 4,
            timestamp: '2023-01-06',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 6,
            actionTakenString: {
              key: 'task.history.action_taken.working_on_it',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-A',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: 'mock-user-id-1',
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task cancelled',
            taskStatus: 4,
            timestamp: '2023-01-07',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 6,
            actionTakenString: {
              key: 'task.history.action_taken.no_longer_working_on_it',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-A',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: '',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task cancelled',
            taskStatus: 4,
            timestamp: '2023-01-08',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 7,
            actionTakenString: {
              key: 'task.history.action_taken.urgent_value_update',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-1',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: null,
            isUrgent: true,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task cancelled',
            taskStatus: 4,
            timestamp: '2023-01-09',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: 8,
            actionTakenString: {
              key: 'task.history.action_taken.fa_payment_update',
              params: [
                {
                  x: 'mock-user-name',
                  y: 'mock-team-1',
                  z: 'FA-payment-1',
                },
              ],
            },
            currentTeamId: '',
            currentTeamName: 'mock-team-A',
            currentUserWorkingOn: null,
            financialAssistancePaymentId: null,
            financialAssistancePaymentName: 'FA-payment-1',
            isUrgent: false,
            previousTeamId: '',
            previousTeamName: 'mock-team-A',
            rationale: 'Personal task cancelled',
            taskStatus: 4,
            timestamp: '2023-01-09',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              teamId: 'team-id-1',
              teamName: 'mock-team-1',
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
        ]);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should get data when created ', async () => {
        wrapper.vm.parseTaskHistory = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.parseTaskHistory).toHaveBeenCalled();
      });
    });
  });
});
