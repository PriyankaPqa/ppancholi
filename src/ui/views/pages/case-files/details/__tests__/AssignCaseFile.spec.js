import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCaseFileEntity } from '@/entities/case-file';
import { AccountStatus, mockCombinedUserAccount } from '@/entities/user-account';
import { mockTeam, mockTeamMembersData } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import helpers from '@/ui/helpers';

import Component from '../case-file-activity/components/AssignCaseFile.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCaseFileEntity();
jest.mock('@/store/modules/team/teamUtils');

describe('AssignCaseFile.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('all-teams-list', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('all-teams-list');
        expect(element.exists()).toBeTruthy();
      });

      it('contains a list of teams', () => {
        const element = wrapper.findDataTest(`team-list-item-${mockTeam().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right team information', () => {
        const element = wrapper.findDataTest(`team-list-item-${mockTeam().id}`);
        expect(element.text()).toContain(mockTeam().name);
        expect(element.text()).toContain(mockTeam().getActiveMemberCount());
        expect(element.text()).toContain(mockTeam().teamTypeName.translation.en);
      });
    });

    describe('individuals table', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('individuals-table');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('assigned teams list', () => {
      beforeEach(async () => {
        await wrapper.setData({
          assignedTeams: [mockTeam()],
        });
      });

      it('renders', () => {
        const element = wrapper.findDataTest('assigned-teams-list');
        expect(element.exists()).toBeTruthy();
      });

      it('contains assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-teams-list-item-${mockTeam().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays name of assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-teams-list-item-${mockTeam().id}`);
        expect(element.text()).toContain(mockTeam().name);
      });

      it('contains a button for unassigning', () => {
        const element = wrapper.findDataTest(`unassign_${mockTeam().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('calls removeTeam when the unassign button is clicked', async () => {
        jest.spyOn(wrapper.vm, 'removeTeam').mockImplementation(() => {});
        const element = wrapper.findDataTest(`unassign_${mockTeam().id}`);
        await element.trigger('click');
        expect(wrapper.vm.removeTeam).toHaveBeenCalledTimes(1);
      });
    });

    describe('assigned individuals list', () => {
      let individual;
      beforeEach(async () => {
        // eslint-disable-next-line prefer-destructuring
        individual = {
          ...mockCombinedUserAccount().entity,
          ...mockCombinedUserAccount().metadata,
        };
        await wrapper.setData({
          assignedMembers: [individual],
        });
      });

      it('renders', () => {
        const element = wrapper.findDataTest('assigned-individuals-list');
        expect(element.exists()).toBeTruthy();
      });

      it('contains assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-individuals-list-item-${individual.id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays name of assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-individuals-list-item-${individual.id}`);
        expect(element.text()).toContain(individual.displayName);
      });

      it('contains a button for unassigning', () => {
        const element = wrapper.findDataTest(`unassign_${individual.id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('calls removeMember when the unassign button is clicked', async () => {
        jest.spyOn(wrapper.vm, 'removeMember').mockImplementation(() => {});
        const element = wrapper.findDataTest(`unassign_${individual.id}`);
        await element.trigger('click');
        expect(wrapper.vm.removeMember).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('headers', () => {
      it('returns the right values', () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'teams.member_name',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'displayName',
          },
          {
            text: 'teams.member_role',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'translatedRoleName',
          },
        ]);
      });
    });

    describe('displayedMembers', () => {
      beforeEach(() => {
        helpers.filterCollectionByValue = jest.fn(() => ['mock-displayed-members']);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
            show: true,
          },
          mocks: {
            $storage: storage,
          },
        });
      });
      it('calls the helper filterCollectionByValue with allMembers and searchTerm and return the result', () => {
        const members = wrapper.vm.displayedMembers;

        expect(members).toEqual(['mock-displayed-members']);
      });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(() => {
        storage.team.actions.searchAggregatedTeams = jest.fn(() => []);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
            show: true,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.getTeamsData = jest.fn();
      });

      it('calls getTeamsData', () => {
        jest.spyOn(wrapper.vm, 'getTeamsData').mockImplementation();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.getTeamsData).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedTeams', async () => {
        jest.spyOn(wrapper.vm, 'getTeamsData').mockImplementation(() => {});

        jest.spyOn(wrapper.vm, 'setAssignedTeams').mockImplementation(() => {});
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.setAssignedTeams).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedMembers', async () => {
        jest.spyOn(wrapper.vm, 'setAssignedMembers').mockImplementation(() => {});
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.setAssignedMembers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('close', () => {
      it('emits update:show false', async () => {
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('setAllMembers', () => {
      it('returns the right values', async () => {
        wrapper.vm.allTeams = [mockTeam()];
        await wrapper.vm.setAllMembers();
        const expectedAllMembers = [
          {
            ...mockTeamMembersData()[0],
            translatedRoleName: mockTeamMembersData()[0].roleName.translation.en,
          },
          {
            ...mockTeamMembersData()[1],
            translatedRoleName: mockTeamMembersData()[1].roleName.translation.en,
          },
        ];
        expect(wrapper.vm.allMembers).toEqual(expectedAllMembers);
      });
    });

    describe('setAssignedTeams', () => {
      it('sets assignedTeams to teams that have the id among assignedTeamIds of the case file', async () => {
        const ids = wrapper.vm.caseFile.assignedTeamIds;
        wrapper.vm.allTeams = [{ ...mockTeam(), id: ids[0] }, { ...mockTeam(), id: 'foo' }];
        await wrapper.vm.setAssignedTeams();

        expect(wrapper.vm.assignedTeams).toEqual([{ ...mockTeam(), id: ids[0] }]);
      });
    });

    describe('setAssignedMembers', () => {
      it('sets setAssignedMembers to members that have the id among assignedMembersIds of the case file and are active', async () => {
        const members = [
          {
            ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
            accountStatus: AccountStatus.Active,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
            accountStatus: AccountStatus.Inactive,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-3' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-3' }).metadata,
            accountStatus: AccountStatus.Active,
          },

        ];

        wrapper.vm.allMembers = members;
        wrapper.vm.caseFile.assignedIndividualIds = ['guid-1', 'guid-2'];

        await wrapper.vm.setAssignedMembers();

        expect(wrapper.vm.assignedMembers).toEqual([{
          ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
          ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
          accountStatus: AccountStatus.Active,
        }]);
      });
    });

    describe('isSelected', () => {
      it('returns true if the argument is part of assignedMembers', () => {
        wrapper.vm.assignedMembers = [
          {
            ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
          },
        ];
        expect(wrapper.vm.isSelected({
          ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
          ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
        })).toBeTruthy();
      });

      it('returns false if the argument is not part of assignedMembers', () => {
        wrapper.vm.assignedMembers = [
          {
            ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
          },
        ];
        expect(wrapper.vm.isSelected({
          ...mockCombinedUserAccount({ id: 'guid-3' }).entity,
          ...mockCombinedUserAccount({ id: 'guid-3' }).metadata,
        })).toBeFalsy();
      });
    });

    describe('removeMember', () => {
      it('removes an individual from assignedMembers', async () => {
        wrapper.vm.assignedMembers = [
          {
            ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
          },
        ];
        await wrapper.vm.removeMember({
          ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
          ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
        });
        expect(wrapper.vm.assignedMembers).toEqual([{
          ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
          ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
        }]);
      });
    });

    describe('removeTeam', () => {
      it('removes a team from assignedTeams', async () => {
        wrapper.vm.assignedTeams = [
          { ...mockTeam(), id: 'id-1' },
          { ...mockTeam(), id: 'id-2' },
        ];
        await wrapper.vm.removeTeam({ ...mockTeam(), id: 'id-2' });
        expect(wrapper.vm.assignedTeams).toEqual([{ ...mockTeam(), id: 'id-1' }]);
      });
    });

    describe('submit', () => {
      it('calls action setCaseFileAssign with the right payload', async () => {
        wrapper.vm.assignedMembers = [
          {
            ...mockCombinedUserAccount({ id: 'guid-1' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-1' }).metadata,
          },
          {
            ...mockCombinedUserAccount({ id: 'guid-2' }).entity,
            ...mockCombinedUserAccount({ id: 'guid-2' }).metadata,
          },
        ];
        wrapper.vm.assignedTeams = [
          { ...mockTeam(), id: 'team-id-1' },
          { ...mockTeam(), id: 'team-id-2' },
        ];
        await wrapper.vm.submit();
        expect(storage.caseFile.actions.setCaseFileAssign)
          .toHaveBeenCalledWith(wrapper.vm.caseFile.id, ['guid-1', 'guid-2'], ['team-id-1', 'team-id-2']);
      });

      it('emits updateAssignmentsInfo with the right payload', async () => {
        const teams = [
          { ...mockTeam(), id: 'team-id-1' },
          { ...mockTeam(), id: 'team-id-2' },
        ];

        wrapper.vm.assignedMembers = [
          {
            ...mockCombinedUserAccount({ id: 'member-id-1' }).entity,
            ...mockCombinedUserAccount({ id: 'member-id-1' }).metadata,
            translatedRoleName: 'mock-role-1',
          },
          {
            ...mockCombinedUserAccount({ id: 'member-id-2' }).entity,
            ...mockCombinedUserAccount({ id: 'member-id-2' }).metadata,
            translatedRoleName: 'mock-role-2',
          },
        ];
        wrapper.vm.assignedTeams = teams;
        await wrapper.vm.submit();
        expect(wrapper.emitted('updateAssignmentsInfo')[0][0]).toEqual({
          teams,
          individuals: [
            {
              ...mockCombinedUserAccount({ id: 'member-id-1' }).entity,
              ...mockCombinedUserAccount({ id: 'member-id-1' }).metadata,
            },
            {
              ...mockCombinedUserAccount({ id: 'member-id-2' }).entity,
              ...mockCombinedUserAccount({ id: 'member-id-2' }).metadata,
            },
          ],
        });
      });

      it('emits update:show false', async () => {
        await wrapper.vm.submit();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('emits updateActivities', async () => {
        await wrapper.vm.submit();
        expect(wrapper.emitted('updateActivities')).toBeTruthy();
      });
    });
  });
});
