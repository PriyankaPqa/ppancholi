import { createLocalVue, shallowMount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { ActionTaken, mockTaskActionHistories, TaskStatus } from '@libs/entities-lib/task';
import { mockTeamEntity } from '@libs/entities-lib/team';
import Component from './TaskHistoryDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('TaskHistoryDialog.vue', () => {
  const wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      show: true,
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
            text: 'task.history.header.edited_by',
            filterable: false,
            value: 'userInformation.userName',
            width: '20%',
            sortable: true,
          },
          {
            text: 'task.history.header.date_of_change',
            filterable: false,
            value: 'timestamp',
            width: '15%',
            sortable: true,
          },
          {
            text: 'task.history.header.action_taken',
            filterable: false,
            value: 'actionTaken',
            width: '20%',
            sortable: true,
          },
          {
            text: 'task.history.header.rationale',
            filterable: false,
            value: 'rationale',
            width: '45%',
            sortable: false,
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
          .toEqual({ key: 'task.history.action_taken.assigned', params: [{ x: 'mock-team-name-1' }] });
      });

      it('should generate action string for ActionCompleted properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[2], 'mock-team-name-1', 'mock-team-name-2'))
          .toEqual({ key: 'task.history.action_taken.action_completed', params: [{ x: 'mock-team-name-1', y: 'mock-team-name-2' }] });
      });

      it('should generate action string for TaskCompleted properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[3])).toEqual('task.history.action_taken.completed');
      });

      it('should generate action string for Re-open properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[4])).toEqual('task.history.action_taken.reopen');
      });

      it('should generate action string for personal task completed properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[5])).toEqual('task.history.action_taken.completed');
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
            actionTaken: null,
            actionTakenString: 'task.history.action_taken.completed',
            currentTeamId: '',
            currentTeamName: '',
            previousTeamId: '',
            previousTeamName: '',
            rationale: 'Personal task completed',
            taskStatus: TaskStatus.Completed,
            timestamp: '2023-01-03',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: ActionTaken.Reopen,
            actionTakenString: 'task.history.action_taken.reopen',
            currentTeamId: 'mock-team-id-3',
            currentTeamName: 'mock-team-3',
            previousTeamId: 'mock-team-id-3',
            previousTeamName: 'mock-team-3',
            rationale: 'team 3 re-open task',
            taskStatus: TaskStatus.InProgress,
            timestamp: '2023-01-03',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: ActionTaken.Completed,
            actionTakenString: 'task.history.action_taken.completed',
            currentTeamId: 'mock-team-id-3',
            currentTeamName: 'mock-team-3',
            previousTeamId: 'mock-team-id-3',
            previousTeamName: 'mock-team-3',
            rationale: 'team 3 complete task',
            taskStatus: TaskStatus.Completed,
            timestamp: '2023-01-03',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: ActionTaken.Completed,
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
            previousTeamId: 'mock-team-id-2',
            previousTeamName: 'mock-team-2',
            rationale: 'team 2 finish action, assign to team 3',
            taskStatus: TaskStatus.InProgress,
            timestamp: '2023-01-02',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: ActionTaken.Assign,
            actionTakenString: {
              key: 'task.history.action_taken.assigned',
              params: [
                {
                  x: 'mock-team-2',
                },
              ],
            },
            currentTeamId: 'mock-team-id-2',
            currentTeamName: 'mock-team-2',
            previousTeamId: 'mock-team-id-1',
            previousTeamName: 'mock-team-1',
            rationale: 'assign task to team 2',
            taskStatus: TaskStatus.InProgress,
            timestamp: '2023-01-01',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
              userId: 'mock-user-id-1',
              userName: 'mock-user-name',
            },
          },
          {
            actionTaken: ActionTaken.Create,
            actionTakenString: 'task.history.action_taken.created',
            currentTeamId: 'mock-team-id-1',
            currentTeamName: 'mock-team-1',
            previousTeamId: '',
            previousTeamName: '',
            rationale: 'create task',
            taskStatus: TaskStatus.InProgress,
            timestamp: '2023-01-01',
            userInformation: {
              roleId: 'mock-role-id-1',
              roleName: {
                translation: {
                  en: 'mock-role-name en',
                  fr: 'mock-role-name fr',
                },
              },
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
