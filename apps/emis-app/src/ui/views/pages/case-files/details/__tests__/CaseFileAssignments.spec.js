import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileEntity, CaseFileStatus } from '@libs/entities-lib/case-file';
import { mockStorage } from '@/storage';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { mockTeamEntity } from '@libs/entities-lib/team';

import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import Component from '../case-file-activity/components/CaseFileAssignments.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCaseFileEntity();
const mockTeam = mockTeamEntity();
const { pinia, teamStore } = useMockTeamStore();

describe('CaseFileAssignments.vue', () => {
  let wrapper;
  teamStore.getTeamsAssigned = jest.fn(() => [mockTeamEntity()]);
  describe('Template', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia: getPiniaForUser('level3'),
        propsData: {
          caseFile: mockCaseFile,
        },
        computed: {
          canAssign() {
            return true;
          },
        },
        mocks: {
          $storage: storage,
        },
      });
      wrapper.vm.loading = false;
    });

    describe('assignments info', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('case-file-assigned-info');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right text when there is an assigned team', async () => {
        await wrapper.setData({ assignedTeamInfo: 'Team 1', assignedIndividualsInfo: null });
        const element = wrapper.findDataTest('case-file-assigned-info');
        expect(element.text()).toEqual('Team 1');
      });

      it('contains the right text when there is an assigned individual', async () => {
        await wrapper.setData({ assignedTeamInfo: null, assignedIndividualsInfo: 'Jane Smith' });
        const element = wrapper.findDataTest('case-file-assigned-info');
        expect(element.text()).toEqual('Jane Smith');
      });

      it('contains the right text when there is an assigned individual and an assigned team', async () => {
        await wrapper.setData({ assignedTeamInfo: 'Team 1', assignedIndividualsInfo: 'Jane Smith' });
        const element = wrapper.findDataTest('case-file-assigned-info');
        expect(element.text()).toEqual('Jane Smith common.and Team 1');
      });

      it('contains the right text when the case file is not assigned', async () => {
        await wrapper.setData({ assignedTeamInfo: null, assignedIndividualsInfo: null });
        const element = wrapper.findDataTest('case-file-assigned-info');
        expect(element.text()).toEqual('caseFileDetail.notAssigned');
      });
    });

    describe('case file assign button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('case-file-assign-btn');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if canAssign is set to false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            caseFile: mockCaseFile,
          },
          computed: {
            canAssign() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        element = wrapper.findDataTest('case-file-assign-btn');
      });

      it('sets showAssignmentsDialog when clicked', async () => {
        wrapper.vm.showAssignmentsDialog = false;
        await element.vm.$emit('click');
        expect(wrapper.vm.showAssignmentsDialog).toBeTruthy();
      });
    });

    describe('Dialog Assign case file', () => {
      it('renders when showAssignmentsDialog is true', async () => {
        await wrapper.setData({ showAssignmentsDialog: true });
        const element = wrapper.findDataTest('assignments-dialog');
        expect(element.exists()).toBeTruthy();
      });

      it('calls setAssignmentsInfoFromData when updateAssignmentsInfo is emitted', async () => {
        jest.spyOn(wrapper.vm, 'setAssignmentsInfoFromData').mockImplementation(() => {});
        await wrapper.setData({ showAssignmentsDialog: true });
        const element = wrapper.findDataTest('assignments-dialog');
        element.vm.$emit('updateAssignmentsInfo');
        expect(wrapper.vm.setAssignmentsInfoFromData).toHaveBeenCalledTimes(1);
      });
    });

    describe('view assigned button', () => {
      let element;
      it('is does not render if canAssign is true', () => {
        element = wrapper.findDataTest('case-file-view-assign-btn');
        expect(element.exists()).toBeFalsy();
      });

      it('renders if canAssign is set to false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            caseFile: mockCaseFile,
          },
          computed: {
            canAssign() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        element = wrapper.findDataTest('case-file-view-assign-btn');
        expect(element.exists()).toBeTruthy();
      });

      it('sets showAssignmentsDialog when clicked', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            caseFile: mockCaseFile,
          },
          computed: {
            canAssign() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        element = wrapper.findDataTest('case-file-view-assign-btn');
        wrapper.vm.showViewAssignmentsDialog = false;
        await element.vm.$emit('click');
        expect(wrapper.vm.showViewAssignmentsDialog).toBeTruthy();
      });
    });
  });

  describe('Life cycle', () => {
    describe('created', () => {
      it('calls setAssignmentsInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            caseFile: mockCaseFile,
          },
          mocks: {
            $storage: storage,
          },
        });
        jest.spyOn(wrapper.vm, 'setAssignmentsInfo');
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignmentsInfo).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('computed', () => {
    describe('canAssign', () => {
      it('returns true if the user has level 6 ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  search: jest.fn(() => ({ ids: [] })),
                },
              },
            },
          },
        });
        expect(wrapper.vm.canAssign).toBeTruthy();
      });

      it('returns true if the user has level between 3 and 5 and case file status is open', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open }),
          },
          pinia: getPiniaForUser('level4'),
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  search: jest.fn(() => ({ ids: [] })),
                },
              },
              team: {
                actions: {
                  getTeamsAssigned: jest.fn(() => [mockTeamEntity()]),
                },
              },
            },
          },
        });
        expect(wrapper.vm.canAssign).toBeTruthy();
      });

      it('returns false if the user has level between 3 and 5 and property readonly is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFileEntity(),
            readonly: false,
          },
          pinia: getPiniaForUser('level4'),
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  search: jest.fn(() => ({ ids: [] })),
                },
              },
              team: {
                actions: {
                  getTeamsAssigned: jest.fn(() => [mockTeamEntity()]),
                },
              },
            },
          },
        });
        expect(wrapper.vm.canAssign).toBeTruthy();
        await wrapper.setProps({ readonly: true });
        expect(wrapper.vm.canAssign).toBeFalsy();
      });

      it('returns false if the user has level below 3', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  search: jest.fn(() => ({ ids: [] })),
                },
              },
              team: {
                actions: {
                  getTeamsAssigned: jest.fn(() => [mockTeamEntity()]),
                },
              },
            },
          },
          pinia: getPiniaForUser('level2'),
        });
        expect(wrapper.vm.canAssign).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          caseFile: mockCaseFile,
        },
        mocks: {
          $storage: storage,
        },
      });
      wrapper.vm.loading = false;
    });

    describe('setAssignmentsInfoFromData', () => {
      it('sets the right team info', async () => {
        const individuals = [];
        const teams = [mockTeam];
        await wrapper.vm.setAssignmentsInfoFromData({ individuals, teams });
        expect(wrapper.vm.assignedTeamInfo).toEqual(mockTeam.name);
      });

      it('sets the right individuals info', async () => {
        jest.clearAllMocks();
        jest.spyOn(wrapper.vm, 'createAssignedIndividualsInfo').mockImplementation(() => 'mock-member-name');
        const individuals = [];
        const teams = [];
        await wrapper.vm.setAssignmentsInfoFromData({ individuals, teams });
        expect(wrapper.vm.assignedIndividualsInfo).toEqual('mock-member-name');
      });
    });

    describe('setAssignmentsInfo', () => {
      it('sets the right team info', async () => {
        jest.spyOn(wrapper.vm, 'getAssignedTeamInfo').mockImplementation(() => 'mock-team-name');

        await wrapper.vm.setAssignmentsInfo();
        expect(wrapper.vm.assignedTeamInfo).toEqual('mock-team-name');
      });

      it('sets the right individuals info', async () => {
        jest.spyOn(wrapper.vm, 'getAssignedIndividualsInfo').mockImplementation(() => 'mock-member-name-2');

        await wrapper.vm.setAssignmentsInfo();
        expect(wrapper.vm.assignedIndividualsInfo).toEqual('mock-member-name-2');
      });
    });

    describe('getAssignedTeamInfo', () => {
      it('calls storage action getTeamsAssigned with the right id', async () => {
        jest.clearAllMocks();
        await wrapper.vm.getAssignedTeamInfo();
        expect(teamStore.getTeamsAssigned).toHaveBeenCalledWith(mockCaseFile.id);
      });

      it('returns the right value', async () => {
        const team1 = mockTeamEntity({ id: '1', name: 'A' });
        const team2 = mockTeamEntity({ id: '2', name: 'B' });
        const mockTeams = [team1, team2];
        teamStore.getTeamsAssigned = jest.fn(() => mockTeams);

        const caseFile = { ...mockCaseFile, assignedTeamIds: ['2'] };
        await wrapper.setProps({ caseFile });

        const name = await wrapper.vm.getAssignedTeamInfo();
        expect(name).toEqual('B');
      });
    });

    describe('getAssignedIndividualsInfo', () => {
      it('calls storage action searchUsers', async () => {
        jest.clearAllMocks();
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: [mockCombinedUserAccount().entity.id] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        await wrapper.vm.getAssignedIndividualsInfo();
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledTimes(1);
      });

      it('calls createAssignedIndividualsInfo with the storage getter results', async () => {
        jest.spyOn(wrapper.vm, 'createAssignedIndividualsInfo');
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: [mockCombinedUserAccount().entity.id] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        await wrapper.vm.getAssignedIndividualsInfo();
        expect(wrapper.vm.createAssignedIndividualsInfo)
          .toHaveBeenCalledWith([mockCombinedUserAccount().metadata.displayName]);
      });

      it('returns the response of createAssignedIndividualsInfo ', async () => {
        jest.spyOn(wrapper.vm, 'createAssignedIndividualsInfo').mockImplementation(() => 'mock-individual-name');
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: [mockCombinedUserAccount().entity.id] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        const name = await wrapper.vm.getAssignedIndividualsInfo();
        expect(name).toEqual('mock-individual-name');
      });
    });

    describe('createAssignedIndividualsInfo', () => {
      it('returns the correct name if there is one user', () => {
        const users = ['John Doe'];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('John Doe');
      });

      it('returns the correct name if there are two users', () => {
        const users = ['John Doe', 'Jane Smith'];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('John Doe common.and Jane Smith');
      });
      it('returns empty string if there are no users', () => {
        const users = [];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('');
      });
    });
  });
});
