import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData } from '@/entities/case-file';
import { mockTeamsData, mockSearchTeams } from '@/entities/team';
import { mockUserAccountSearchData, UserAccount } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';
import { mockUserStateLevel } from '@/test/helpers';

import Component from '../case-file-activity/components/CaseFileAssignments.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);

describe('CaseFileAssignments.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
        },
        store: {
          ...mockUserStateLevel(3),
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

      it('does not render if user level is below 3', async () => {
        await wrapper.setRole('level2');
        expect(element.exists()).toBeFalsy();
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

      it('emits updateActivities when updateActivities is emitted', async () => {
        await wrapper.setData({ showAssignmentsDialog: true });
        const element = wrapper.findDataTest('assignments-dialog');
        element.vm.$emit('updateActivities');
        expect(wrapper.emitted('updateActivities')).toBeTruthy();
      });
    });
  });

  describe('Life cycle', () => {
    describe('created', () => {
      it('calls setAssignmentsInfo if user has level 3 or more', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
          },
          store: {
            ...mockUserStateLevel(3),
          },
        });
        jest.spyOn(wrapper.vm, 'setAssignmentsInfo');
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignmentsInfo).toHaveBeenCalledTimes(1);
      });

      it('does not call setAssignmentsInfo if user has level 2 or less', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
          },
          store: {
            ...mockUserStateLevel(2),
          },
        });
        jest.spyOn(wrapper.vm, 'setAssignmentsInfo');
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignmentsInfo).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.userAccount.actions.searchUserAccounts = jest.fn(() => ({ value: [new UserAccount(mockUserAccountSearchData)] }));
      wrapper = shallowMount(Component, {
        localVue,
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
        const teams = [mockTeamsData()[0]];
        await wrapper.vm.setAssignmentsInfoFromData({ individuals, teams });
        expect(wrapper.vm.assignedTeamInfo).toEqual(mockTeamsData()[0].name);
      });

      it('sets the right individuals info', async () => {
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
      it('calls storage action searchTeams with the right id', async () => {
        const id = wrapper.vm.caseFile.assignedTeamIds[0];
        await wrapper.vm.getAssignedTeamInfo();
        expect(storage.team.actions.searchTeams).toHaveBeenCalledWith({ filter: { TeamId: id } });
      });

      it('returns the right value', async () => {
        const name = await wrapper.vm.getAssignedTeamInfo();
        expect(name).toEqual(mockSearchTeams().value[0].teamName);
      });
    });

    describe('getAssignedIndividualsInfo', () => {
      it('calls storage action searchUserAccounts with the right ids', async () => {
        jest.clearAllMocks();
        const ids = [wrapper.vm.caseFile.assignedIndividualIds[0], wrapper.vm.caseFile.assignedIndividualIds[1]];
        await wrapper.vm.getAssignedIndividualsInfo();
        expect(storage.userAccount.actions.searchUserAccounts).toHaveBeenCalledTimes(1);
        expect(storage.userAccount.actions.searchUserAccounts)
          .toHaveBeenCalledWith({ filter: `search.in(UserAccountId, '${ids[0]}|${ids[1]}', '|')` });
      });

      it('calls createAssignedIndividualsInfo with the storage call results', async () => {
        jest.spyOn(wrapper.vm, 'createAssignedIndividualsInfo').mockImplementation(() => 'mock-individual-name');
        await wrapper.vm.getAssignedIndividualsInfo();
        expect(wrapper.vm.createAssignedIndividualsInfo)
          .toHaveBeenCalledWith([new UserAccount(mockUserAccountSearchData)]);
      });

      it('returns the response of createAssignedIndividualsInfo ', async () => {
        jest.spyOn(wrapper.vm, 'createAssignedIndividualsInfo').mockImplementation(() => 'mock-individual-name');
        const name = await wrapper.vm.getAssignedIndividualsInfo();
        expect(name).toEqual('mock-individual-name');
      });
    });

    describe('createAssignedIndividualsInfo', () => {
      it('returns the correct name if there is one user', () => {
        const users = [{ displayName: 'John Doe' }];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('John Doe');
      });

      it('returns the correct name if there are two users', () => {
        const users = [{ displayName: 'John Doe' }, { displayName: 'Jane Smith' }];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('John Doe common.and Jane Smith');
      });
      it('returns empty string if there are no users', () => {
        const users = [];
        expect(wrapper.vm.createAssignedIndividualsInfo(users)).toEqual('');
      });
    });
  });
});
