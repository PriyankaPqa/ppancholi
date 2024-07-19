import caseFileTask from '@/ui/mixins/caseFileTask';
import { mockOptionItem, mockOptionItems, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskStatus } from '@libs/entities-lib/task';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { Status } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/entities-lib/user';
import { mockTeamEntity, mockTeamEvents, mockTeamsDataStandard } from '@libs/entities-lib/team';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { mockCaseFinancialAssistanceEntity } from '@libs/entities-lib/financial-assistance-payment';
import flushPromises from 'flush-promises';
import { useMockTeamStore } from '@/pinia/team/team.mock';

const Component = {
  render() {},
  mixins: [caseFileTask],
};

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userStore } = useMockUserStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);
const { teamStore } = useMockTeamStore(pinia);
let wrapper;

describe('caseFileTask', () => {
  const doMount = async (shallow = true, otherOptions = {}, level = 5, hasRole = 'role') => {
    const options = {
      localVue,
      pinia,
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await doMount();
  });

  describe('Computed', () => {
    describe('taskCategories', () => {
      it('should return proper data from store', () => {
        const options = mockOptionItems();
        taskStore.getTaskCategory = () => options;
        expect(wrapper.vm.taskCategories).toEqual(options);
      });

      it('should get the inactive actual value item', async () => {
        const options = [mockOptionItem({ id: '1', status: Status.Active }), mockOptionItem({ id: '2', status: Status.Inactive })];
        await wrapper.setData({
          selectedTaskCategoryId: '2',
        });
        taskStore.getTaskCategory = jest.fn(() => options);
        expect(wrapper.vm.taskCategories).toEqual(options);
      });
    });

    describe('taskSubCategories', () => {
      it('should return proper subitems', async () => {
        await wrapper.setData({
          selectedTaskCategoryId: '1',
        });
        const options = mockOptionItems();
        taskStore.getTaskCategory = jest.fn(() => options);
        const expectedRes = [mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' })];
        expect(wrapper.vm.taskSubCategories).toEqual(expectedRes);
      });

      it('should get the inactive actual value sub-item', async () => {
        const expectedRes = [[mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' }), mockOptionSubItem({ id: '2', status: Status.Inactive })]];
        await wrapper.setData({
          selectedTaskCategoryId: '1',
          selectedSubCategoryId: '2',
        });
        const options = mockOptionItems({ subitems: [mockOptionSubItem({ id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f' }), mockOptionSubItem({ id: '2', status: Status.Inactive })] });
        taskStore.getTaskCategory = jest.fn(() => options);
        taskStore.filterAndSortActiveSubItems = jest.fn(() => expectedRes);
        expect(wrapper.vm.taskSubCategories).toEqual(expectedRes);
      });
    });

    describe('selectedTaskCategory', () => {
      it('should return proper selected task category option', async () => {
        await wrapper.setData({
          selectedTaskCategoryId: '1',
        });
        const options = [mockOptionItem({ id: '1' }), mockOptionItem({ id: '2' })];
        taskStore.getTaskCategory = jest.fn(() => options);
        const expectedRes = options.filter((o) => o.id === '1')[0];
        expect(wrapper.vm.selectedTaskCategory).toEqual(expectedRes);
      });
    });

    describe('selectedSubCategory', () => {
      it('should return proper selected task sub-category', async () => {
        await doMount(true, {
          computed: {
            taskCategories: () => mockOptionItems(),
            taskSubCategories: () => [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }), mockOptionSubItem({ id: '2' })],
          },
        });
        await wrapper.setData({
          selectedTaskCategoryId: '1',
          selectedSubCategoryId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
        });
        expect(wrapper.vm.selectedSubCategory).toEqual(mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }));
      });
    });

    describe('personIsWorkingOn', () => {
      it('should return assigned user name when there is', async () => {
        userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata({ displayName: 'mock-name' }));
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }),
          },
        });
        expect(wrapper.vm.personIsWorkingOn).toEqual('mock-name (System Admin)');
      });

      it('should return N/A when there is not user working on', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ userWorkingOn: null }),
          },
        });
        expect(wrapper.vm.personIsWorkingOn).toEqual('common.N/A');
      });
    });

    describe('canAction', () => {
      it('returns calculateCanAction', () => {
        doMount();
        wrapper.vm.calculateCanAction = jest.fn(() => true);
        wrapper.vm.$nextTick();
        expect(wrapper.vm.canAction).toBeTruthy();

        doMount();
        wrapper.vm.calculateCanAction = jest.fn(() => false);
        wrapper.vm.$nextTick();

        expect(wrapper.vm.canAction).toBeFalsy();
      });
    });

    describe('canToggleIsWorkingOn', () => {
      it('calls calculateCanAction and returns the result', () => {
        doMount();
        wrapper.vm.calculateCanAction = jest.fn(() => true);
        wrapper.vm.$nextTick();
        expect(wrapper.vm.canAction).toBeTruthy();

        doMount();
        wrapper.vm.calculateCanAction = jest.fn(() => false);
        wrapper.vm.$nextTick();

        expect(wrapper.vm.canAction).toBeFalsy();
      });
    });

    describe('hasRoleOrLevelAboveZero', () => {
      it('returns true if user is level 1 or has a role', async () => {
        await doMount(true, {}, 1);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeTruthy();
        await doMount(true, {}, 0, UserRoles.contributorIM);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeTruthy();
        await doMount(true, {}, 0, UserRoles.readonly);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeTruthy();
        await doMount(true, {}, 0, UserRoles.contributor3);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeTruthy();
        await doMount(true, {}, 0, UserRoles.contributorFinance);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeTruthy();
      });
      it('returns false if user is level 0 or has no role', async () => {
        await doMount(true, {}, 0);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeFalsy();
        await doMount(true, {}, 0, UserRoles.noAccess);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeFalsy();
        await doMount(true, {}, 0, UserRoles.no_role);
        expect(wrapper.vm.hasRoleOrLevelAboveZero).toBeFalsy();
      });
    });

    describe('isInAssignedTeam', () => {
      it('returns true if user is in assigned team', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          },
        }, 1);
        expect(wrapper.vm.isInAssignedTeam).toEqual(true);
      });

      it('returns false if user is not in assigned team', async () => {
        userStore.getUserId = jest.fn(() => 'user-2');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          },
        }, 1);
        expect(wrapper.vm.isInAssignedTeam).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('setWorkingOn', () => {
      it('should call store setWorkingOn with proper params', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-id-1');
        taskStore.setWorkingOn = jest.fn();
        await doMount(true, {
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
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        wrapper.vm.setWorkingOn = jest.fn();
        await wrapper.vm.onToggleChange(true);
        expect(wrapper.vm.setWorkingOn).toHaveBeenCalled();
      });

      it('should call $confirm when params is false', async () => {
        await doMount(true, {
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
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.setWorkingOn = jest.fn();
        await wrapper.vm.onToggleChange(false);
        expect(wrapper.vm.setWorkingOn).toHaveBeenCalledWith(false);
      });

      it('should call reset isWorkingOn when $confirm is false', async () => {
        await doMount(true, {
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

    describe('fetchSelectedFAPaymentAndSetName', () => {
      it('should call FinancialAssistancePayment search and set the name of the fa payment', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ financialAssistancePaymentId: 'mock-fa-payment-id-123' }));
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ financialAssistancePaymentId: 'mock-fa-payment-id-123' }),
          },
        });
        financialAssistancePaymentStore.fetch.mockResolvedValueOnce(mockCaseFinancialAssistanceEntity({ name: 'mock-fa-payment-name' }));
        await flushPromises();

        await wrapper.vm.fetchSelectedFAPaymentAndSetName();
        expect(financialAssistancePaymentStore.fetch).toHaveBeenCalledWith('mock-fa-payment-id-123');
        expect(wrapper.vm.financialAssistancePaymentName).toEqual('mock-fa-payment-name');
      });
    });

    describe('calculateCanAction', () => {
      it('should be false for L6 user if it is completed personal task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.Completed }),
          },
        }, 6);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be false even for L6 user if it is a cancelled personal task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.Cancelled }),
          },
        }, 6);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be true for team task L6 user', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        }, 6);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be true for in progress personal task L6 user', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity(),
          },
        }, 6);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be false for completed personal task L6 user', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.Completed }),
          },
        }, 6);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be true for personal task if he is the creator and task is in progress', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress, createdBy: 'mock-id-1' }),
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be false for personal task if he is the creator and task is completed', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.Completed, createdBy: 'mock-id-1' }),
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be false for personal task if he is not the creator and task is in progress', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress, createdBy: 'mock-id-2' }),
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be true for team task if user is creator and status is new', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');

        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'mock-id-1', taskStatus: TaskStatus.New }),
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be true for team task if user is creator and status is cancelled', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');

        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'mock-id-1', taskStatus: TaskStatus.Cancelled }),
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be false for team task if user is creator, status is new but togglingIsWorkingOn is true and user is not assigned to team', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'mock-id-1', taskStatus: TaskStatus.New }),
            isInAssignedTeam: () => false,
          },
        }, 5);
        expect(wrapper.vm.calculateCanAction(true)).toEqual(false);
      });

      it('should be false for team task with L0 user', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        }, 0);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be false for team task with no-role user', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        }, null, UserRoles.no_role);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be true for team task with L1-L5 user if he is assigned team member', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          },
        }, 1);
        expect(wrapper.vm.calculateCanAction()).toEqual(true);
      });

      it('should be false for team task with L1-L5 user if he is assigned team member, but task is inactive', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }], status: Status.Inactive }),
          },
        }, 1);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });

      it('should be false for team task with L1-L5 user if he is not assigned team member', async () => {
        userStore.getUserId = jest.fn(() => 'user-2');
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-1', teamMembers: [{ id: 'user-1' }] }),
          },
        }, 1);
        expect(wrapper.vm.calculateCanAction()).toEqual(false);
      });
    });

    describe('getAssignableTeams', () => {
      it('should call service getTeamsByEvent event id, filter out unassigned teams and set data properly', async () => {
        teamStore.getTeamsByEvent = jest.fn(() => ([
          mockTeamsDataStandard({ id: '1', isAssignable: true }),
          mockTeamsDataStandard({ id: '2', isAssignable: false }),
          mockTeamsDataStandard({ id: '3', isEscalation: true, teamMembers: [{ id: 'someone' }] }),
        ]));
        await wrapper.setProps({
          eventId: mockTeamEvents()[0].id,
        });
        await wrapper.vm.getAssignableTeams();
        expect(teamStore.getTeamsByEvent).toHaveBeenCalledWith({ eventId: wrapper.vm.eventId });
        expect(wrapper.vm.assignableTeams).toEqual([mockTeamsDataStandard({ id: '1', isAssignable: true })]);
        expect(wrapper.vm.userIsInEscalationTeam).toBeFalsy();

        teamStore.getTeamsByEvent = jest.fn(() => ([
          mockTeamsDataStandard({ id: '1', isAssignable: true }),
          mockTeamsDataStandard({ id: '2', isAssignable: false }),
          mockTeamsDataStandard({ id: '3', isEscalation: true, teamMembers: [{ id: 'someone' }, { id: wrapper.vm.userId }] }),
        ]));
        await wrapper.vm.getAssignableTeams();
        expect(wrapper.vm.userIsInEscalationTeam).toBeTruthy();
      });
    });
  });

  describe('watch', () => {
    describe('task.userWorkingOn', () => {
      it('should set isWorkingOn to false when task is assigned to the same team and userWorkingOn is falsy', async () => {
        await doMount(true, {
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
