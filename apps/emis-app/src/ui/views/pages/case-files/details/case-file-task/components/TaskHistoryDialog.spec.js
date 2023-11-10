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
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[5])).toEqual('task.history.action_taken.created');
      });

      it('should generate action string for Assign properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[4], 'mock-team-name-1'))
          .toEqual({ key: 'task.history.action_taken.assigned', params: [{ x: 'mock-team-name-1' }] });
      });

      it('should generate action string for ActionCompleted properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[3], 'mock-team-name-1', 'mock-team-name-2'))
          .toEqual({ key: 'task.history.action_taken.action_completed', params: [{ x: 'mock-team-name-1', y: 'mock-team-name-2' }] });
      });

      it('should generate action string for TaskCompleted properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[2])).toEqual('task.history.action_taken.completed');
      });

      it('should generate action string for Re-open properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[1])).toEqual('task.history.action_taken.reopen');
      });

      it('should generate action string for personal task completed properly', async () => {
        expect(wrapper.vm.generateTaskActionString(mockTaskActionHistories()[0])).toEqual('task.history.action_taken.completed');
      });
    });

    describe('parseTaskHistory', () => {
      it('should parse data properly', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({
          taskActionHistories: mockTaskActionHistories(),
          teamsByEvent: [
            mockTeamEntity({ id: 'mock-team-id-1', name: 'team-1' }),
            mockTeamEntity({ id: 'mock-team-id-2', name: 'team-2' }),
            mockTeamEntity({ id: 'mock-team-id-3', name: 'team-3' }),
          ],
        });
        wrapper.vm.parseTaskHistory();
        expect(wrapper.vm.parsedTaskActionHistoryData).toEqual([
          {
            actionStatus: 4,
            actionTaken: 'task.history.action_taken.created',
            currentTeamId: 'mock-team-id-1',
            previousTeamId: '',
            rationale: 'create task',
            taskStatus: 1,
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
            actionStatus: 1,
            actionTaken: {
              key: 'task.history.action_taken.assigned',
              params: [
                {
                  x: 'team-2',
                },
              ],
            },
            currentTeamId: 'mock-team-id-2',
            previousTeamId: 'mock-team-id-1',
            rationale: 'assign task to team 2',
            taskStatus: 1,
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
            actionStatus: 2,
            actionTaken: {
              key: 'task.history.action_taken.action_completed',
              params: [
                {
                  x: 'team-3',
                  y: 'team-2',
                },
              ],
            },
            currentTeamId: 'mock-team-id-3',
            previousTeamId: 'mock-team-id-2',
            rationale: 'team 2 finish action, assign to team 3',
            taskStatus: 1,
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
            actionStatus: 2,
            actionTaken: 'task.history.action_taken.completed',
            currentTeamId: 'mock-team-id-3',
            previousTeamId: 'mock-team-id-3',
            rationale: 'team 3 complete task',
            taskStatus: 2,
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
            actionStatus: 3,
            actionTaken: 'task.history.action_taken.reopen',
            currentTeamId: 'mock-team-id-3',
            previousTeamId: 'mock-team-id-3',
            rationale: 'team 3 re-open task',
            taskStatus: 1,
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
            actionStatus: null,
            actionTaken: 'task.history.action_taken.completed',
            currentTeamId: '',
            previousTeamId: '',
            rationale: 'Personal task completed',
            taskStatus: 2,
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
