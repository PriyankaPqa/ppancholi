import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCaseFileEntity } from '@/entities/case-file';
import { mockCombinedUserAccount, AccountStatus } from '@/entities/user-account';
import { mockTeamEntity, TeamType, mockTeamMembersData } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import helpers from '@/ui/helpers/helpers';

import Component from '../case-file-activity/components/AssignCaseFile.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCaseFileEntity();

describe('AssignCaseFile.vue', () => {
  let wrapper;
  storage.userAccount.getters.getAll = jest.fn(() => [
    mockCombinedUserAccount({ id: 'mock-id-1', accountStatus: AccountStatus.Active }),
    mockCombinedUserAccount({ id: 'mock-id-2', accountStatus: AccountStatus.Inactive }),
  ]);
  storage.team.actions.getTeamsAssignable = jest.fn(() => [mockTeamEntity()]);
  const team = { ...mockTeamEntity(), activeMemberCount: 0 };

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
          show: true,
        },
        data() {
          return {
            assignedTeams: [team],
            allTeams: [team],
          };
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
        const element = wrapper.findDataTest(`team-list-item-${mockTeamEntity().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right team information', () => {
        const element = wrapper.findDataTest(`team-list-item-${mockTeamEntity().id}`);
        expect(element.text()).toContain(team.name);
        expect(element.text()).toContain(team.activeMemberCount);
        expect(element.text()).toContain(`enums.TeamType.${TeamType[mockTeamEntity().teamType]}`);
      });
    });

    describe('individuals table', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('individuals-table');
        expect(element.exists()).toBeTruthy();
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

    describe('displayedIndividuals', () => {
      beforeEach(() => {
        helpers.filterCollectionByValue = jest.fn(() => ['mock-displayed-individuals']);
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
      it('calls the helper filterCollectionByValue with allIndividuals and searchTerm and return the result', () => {
        const individuals = wrapper.vm.displayedIndividuals;

        expect(individuals).toEqual(['mock-displayed-individuals']);
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

      it('calls setAssignedIndividuals', async () => {
        jest.spyOn(wrapper.vm, 'setAssignedIndividuals').mockImplementation(() => {});
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.setAssignedIndividuals).toHaveBeenCalledTimes(1);
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

    describe('getTeamsData', () => {
      it('calls storage action getTeamsAssigned with the right id', async () => {
        jest.clearAllMocks();
        await wrapper.vm.getTeamsData();
        expect(storage.team.actions.getTeamsAssignable).toHaveBeenCalledWith(mockCaseFile.eventId);
      });

      it('sets the right value into allTeams', async () => {
        await wrapper.vm.getTeamsData();
        expect(wrapper.vm.allTeams).toEqual([{ ...mockTeamEntity(), activeMemberCount: 0 }]);
      });
    });

    describe('setAllIndividuals', () => {
      it('calls the storage useraccount getter getAll', async () => {
        jest.clearAllMocks();
        await wrapper.vm.setAllIndividuals();
        expect(storage.userAccount.getters.getAll).toHaveBeenCalledTimes(1);
      });

      it('sets the right values into allIndividuals and sets the activeMemberCount into the team', async () => {
        wrapper.vm.allTeams = [{
          ...mockTeamEntity(),
          teamMembers: [
            { id: 'mock-id-1' },
            { id: 'mock-id-2' },
          ],
          activeMemberCount: 0,
        }];
        await wrapper.vm.setAllIndividuals();

        expect(wrapper.vm.allTeams).toEqual([{
          ...mockTeamEntity(),
          teamMembers: [
            { id: 'mock-id-1' },
            { id: 'mock-id-2' },
          ],
          activeMemberCount: 1,
        }]);

        expect(wrapper.vm.allIndividuals).toEqual([{
          id: 'mock-id-1',
          ...mockCombinedUserAccount({ id: 'mock-id-1', accountStatus: AccountStatus.Active }),
          displayName: mockCombinedUserAccount().metadata.displayName,
          translatedRoleName: mockCombinedUserAccount().metadata.roleName.translation.en,
        }]);
      });
    });

    describe('setAssignedTeams', () => {
      it('sets assignedTeams to teams that have the id among assignedTeamIds of the case file', async () => {
        const ids = wrapper.vm.caseFile.assignedTeamIds;
        wrapper.vm.allTeams = [{ ...mockTeamEntity(), id: ids[0] }, { ...mockTeamEntity(), id: 'foo' }];
        await wrapper.vm.setAssignedTeams();

        expect(wrapper.vm.assignedTeams).toEqual([{ ...mockTeamEntity(), id: ids[0] }]);
      });
    });

    describe('setAssignedIndividuals', () => {
      it('sets setAssignedIndividuals to individuals that have the id among assignedIndividualsIds of the case file and are active', async () => {
        const individuals = [
          {
            ...mockTeamMembersData()[0],
            id: 'guid-1',
            entity: {
              accountStatus: AccountStatus.Active,
            },
          },
          {
            ...mockTeamMembersData()[0],
            id: 'guid-2',
            entity: {
              accountStatus: AccountStatus.Inactive,
            },
          },
          {
            ...mockTeamMembersData()[0],
            id: 'guid-3',
            entity: {
              accountStatus: AccountStatus.Active,
            },
          },

        ];

        wrapper.vm.allIndividuals = individuals;
        wrapper.vm.caseFile.assignedIndividualIds = ['guid-1', 'guid-2'];

        await wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.assignedIndividuals).toEqual([{
          ...mockTeamMembersData()[0],
          id: 'guid-1',
          entity: {
            accountStatus: AccountStatus.Active,
          },
        }]);
      });
    });

    describe('isSelected', () => {
      it('returns true if the argument is part of assignedIndividuals', () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        expect(wrapper.vm.isSelected(mockTeamMembersData()[0])).toBeTruthy();
      });

      it('returns false if the argument is not part of assignedIndividuals', () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        expect(wrapper.vm.isSelected({ ...mockTeamMembersData[0], id: 'guid-3' })).toBeFalsy();
      });
    });

    describe('removeIndividual', () => {
      it('removes an individual from assignedIndividuals', async () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        await wrapper.vm.removeIndividual(mockTeamMembersData()[0]);
        expect(wrapper.vm.assignedIndividuals).toEqual([mockTeamMembersData()[1]]);
      });
    });

    describe('removeTeam', () => {
      it('removes a team from assignedTeams', async () => {
        wrapper.vm.assignedTeams = [
          { ...mockTeamEntity(), id: 'id-1' },
          { ...mockTeamEntity(), id: 'id-2' },
        ];
        await wrapper.vm.removeTeam({ ...mockTeamEntity(), id: 'id-2' });
        expect(wrapper.vm.assignedTeams).toEqual([{ ...mockTeamEntity(), id: 'id-1' }]);
      });
    });

    describe('submit', () => {
      it('calls action setCaseFileAssign with the right payload', async () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        wrapper.vm.assignedTeams = [
          { ...mockTeamEntity(), id: 'team-id-1' },
          { ...mockTeamEntity(), id: 'team-id-2' },
        ];
        await wrapper.vm.submit();
        expect(storage.caseFile.actions.setCaseFileAssign)
          .toHaveBeenCalledWith(wrapper.vm.caseFile.id, [mockTeamMembersData()[0].id, mockTeamMembersData()[1].id], ['team-id-1', 'team-id-2']);
      });

      it('emits updateAssignmentsInfo with the right payload', async () => {
        const teams = [
          { ...mockTeamEntity(), id: 'team-id-1' },
          { ...mockTeamEntity(), id: 'team-id-2' },
        ];

        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        wrapper.vm.assignedTeams = teams;
        await wrapper.vm.submit();
        expect(wrapper.emitted('updateAssignmentsInfo')[0][0]).toEqual({
          teams,
          individuals: mockTeamMembersData(),
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
