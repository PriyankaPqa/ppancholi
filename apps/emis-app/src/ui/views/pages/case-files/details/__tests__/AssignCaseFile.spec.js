import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockAssignedTeamMembers, mockCaseFileEntity } from '@/entities/case-file';
import { mockCombinedUserAccount, AccountStatus } from '@/entities/user-account';
import { mockTeamEntity, TeamType, mockTeamMembersData } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import helpers from '@/ui/helpers/helpers';
import Component from '../case-file-activity/components/AssignCaseFile.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCaseFileEntity();
const team = { ...mockTeamEntity(), activeMemberCount: 0 };

storage.userAccount.getters.getAll = jest.fn(() => [
  mockCombinedUserAccount({ id: 'mock-id-1', accountStatus: AccountStatus.Active }),
  mockCombinedUserAccount({ id: 'mock-id-2', accountStatus: AccountStatus.Inactive }),
]);
storage.team.actions.getTeamsAssignable = jest.fn(() => [mockTeamEntity()]);

describe('AssignCaseFile.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
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
      await wrapper.setData({
        initLoading: false,
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
        expect(element.text()).toContain(team.activeMemberCount.toString());
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
          {
            text: 'caseFile.assign.assign',
            class: 'team_member_header',
            value: 'assign',
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

      it('calls the helper filterCollectionByValue with currentTeamMembers and searchTerm and return the result', () => {
        const individuals = wrapper.vm.displayedIndividuals;

        expect(individuals).toEqual(['mock-displayed-individuals']);
      });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(async () => {
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
        wrapper.vm.loadAllUsers = jest.fn();
        wrapper.vm.setAssignedTeams = jest.fn();
        wrapper.vm.setAssignedIndividuals = jest.fn();
      });

      it('calls getTeamsData', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.getTeamsData).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedTeams', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignedTeams).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedIndividuals', async () => {
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

      it('should call resetState', async () => {
        wrapper.vm.resetState = jest.fn();
        await wrapper.vm.close();
        expect(wrapper.vm.resetState).toBeCalled();
      });
    });

    describe('getTeamsData', () => {
      it('calls storage action getTeamsAssignable with the right id', async () => {
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

        const teamName = mockTeamEntity().name;

        expect(wrapper.vm.allIndividuals).toEqual([{
          id: 'mock-id-1',
          ...mockCombinedUserAccount({ id: 'mock-id-1', accountStatus: AccountStatus.Active }),
          displayName: mockCombinedUserAccount().metadata.displayName,
          translatedRoleName: mockCombinedUserAccount().metadata.roleName.translation.en,
          teamName,
          teamId: mockTeamEntity().id,
          itemKey: `mock-id-1_team_${mockTeamEntity().name}`,
          disabled: false,
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
      it('should attach team information to individuals and set the variable', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
            show: true,
          },
          data: () => ({
            assignedTeamMembers: mockAssignedTeamMembers(),
            allIndividuals: [
              { entity: { id: 'mock-assigned-individual-id-1', accountStatus: AccountStatus.Active } },
              { entity: { id: 'mock-assigned-individual-id-2', accountStatus: AccountStatus.Active } },
              { entity: { id: 'mock-assigned-individual-id-3', accountStatus: AccountStatus.Active } },
            ],
            allTeams: [
              { id: 'mock-assigned-team-id-1', name: 'Team A' },
              { id: 'mock-assigned-team-id-2', name: 'Team B' },
            ],
          }),
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.assignedIndividuals).toEqual([
          {
            entity: {
              accountStatus: 1,
              id: 'mock-assigned-individual-id-1',
            },
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              accountStatus: 1,
              id: 'mock-assigned-individual-id-2',
            },
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              accountStatus: 1,
              id: 'mock-assigned-individual-id-3',
            },
            teamId: 'mock-assigned-team-id-2',
            teamName: 'Team B',
          },
        ]);
      });
    });

    describe('isUserSelected', () => {
      it('returns true if the user is part of assignedIndividuals', () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        expect(wrapper.vm.isUserSelected(mockTeamMembersData()[0])).toBeTruthy();
      });

      it('returns false if the user is not part of assignedIndividuals', () => {
        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        expect(wrapper.vm.isUserSelected({ ...mockTeamMembersData[0], id: 'guid-3' })).toBeFalsy();
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

        wrapper.vm.prepareTeamMembersPayload = jest.fn(() => mockAssignedTeamMembers());
        await wrapper.vm.submit();
        expect(storage.caseFile.actions.assignCaseFile)
          .toHaveBeenCalledWith(wrapper.vm.caseFile.id, mockAssignedTeamMembers(), ['team-id-1', 'team-id-2']);
      });

      it('emits updateAssignmentsInfo with the right payload', async () => {
        const teams = [
          { ...mockTeamEntity(), id: 'team-id-1' },
          { ...mockTeamEntity(), id: 'team-id-2' },
        ];

        wrapper.vm.assignedIndividuals = mockTeamMembersData();
        wrapper.vm.assignedTeams = teams;
        await wrapper.vm.submit();
        expect(wrapper.emitted('updateAssignmentsInfo')[0][0]).toEqual({ teams, individuals: mockTeamMembersData() });
      });

      it('emits update:show false', async () => {
        await wrapper.vm.submit();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('assignTeam', () => {
      it('should assign a team', () => {
        const team = mockTeamEntity();
        expect(wrapper.vm.assignedTeams).toEqual([]);
        wrapper.vm.assignTeam(team);
        expect(wrapper.vm.assignedTeams).toEqual([team]);
      });
    });

    describe('assignIndividual', () => {
      const users = [
        {
          id: '1', displayName: 'MisterX', teamId: '1', disabled: false,
        },
        {
          id: '1', displayName: 'MisterX', teamId: '2', disabled: false,
        },
      ];
      beforeEach(async () => {
        await wrapper.setData({
          allIndividuals: users,
          currentTeam: { id: '1' },
        });
      });

      it('should assign an individual', () => {
        wrapper.vm.assignIndividual(users[0]);
        expect(wrapper.vm.assignedIndividuals).toEqual([users[0]]);
      });

      it('should disable the same individual if present in other teams', () => {
        wrapper.vm.assignIndividual(users[0]);
        expect(wrapper.vm.allIndividuals[1].disabled).toEqual(true);
      });
    });

    describe('unAssignIndividual', () => {
      const allIndividuals = [
        {
          id: '1', displayName: 'MisterX', teamId: '1', disabled: false,
        },
        {
          id: '1', displayName: 'MisterX', teamId: '2', disabled: true,
        },
        {
          id: '2', displayName: 'MissY', teamId: '1', disabled: false,
        },
      ];

      const assignedIndividuals = [
        {
          id: '1', displayName: 'MisterX', teamId: '1', disabled: false,
        },
      ];
      beforeEach(async () => {
        await wrapper.setData({
          allIndividuals,
          assignedIndividuals,
          currentTeam: { id: '1' },
        });
      });

      it('should un assign an individual', () => {
        wrapper.vm.unAssignIndividual(assignedIndividuals[0]);
        expect(wrapper.vm.assignedIndividuals).toEqual([]);
      });

      it('should enable the same individual if present in other teams', () => {
        wrapper.vm.unAssignIndividual(assignedIndividuals[0]);
        expect(wrapper.vm.allIndividuals[1].disabled).toEqual(false);
      });
    });

    describe('onSelectIndividuals', () => {
      it('should call assignIndividual when selecting a user', () => {
        wrapper.vm.assignIndividual = jest.fn();
        wrapper.vm.onSelectIndividuals({ item: {}, value: true });
        expect(wrapper.vm.assignIndividual).toBeCalled();
      });

      it('should call unAssignIndividual when unselecting a user', () => {
        wrapper.vm.unAssignIndividual = jest.fn();
        wrapper.vm.onSelectIndividuals({ item: {}, value: false });
        expect(wrapper.vm.unAssignIndividual).toBeCalled();
      });
    });

    describe('prepareTeamMembersPayload', () => {
      it('should prepare the individuals payload to assign a case file', () => {
        const users = [
          {
            id: '1',
            teamId: '1',
          },
          {
            id: '2',
            teamId: '1',
          },
          {
            id: '3',
            teamId: '2',
          },
        ];
        const res = wrapper.vm.prepareTeamMembersPayload(users);
        expect(res).toEqual([
          {
            teamId: '1', teamMembersIds: ['1', '2'],
          },
          {
            teamId: '2', teamMembersIds: ['3'],
          },
        ]);
      });
    });

    describe('saveState', () => {
      it('should backup assigned teams', () => {
        wrapper.setData({
          assignedTeams: [team],
        });
        expect(wrapper.vm.backupAssignedTeams).toEqual([]);
        wrapper.vm.saveState();
        expect(wrapper.vm.backupAssignedTeams).toEqual([team]);
      });

      it('should backup assignedIndividuals teams', () => {
        const assignedIndividuals = [
          {
            entity: {
              accountStatus: 1,
              id: 'mock-assigned-individual-id-1',
            },
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          }];
        wrapper.setData({
          assignedIndividuals,
        });
        expect(wrapper.vm.backupAssignedIndividuals).toEqual([]);
        wrapper.vm.saveState();
        expect(wrapper.vm.backupAssignedIndividuals).toEqual(assignedIndividuals);
      });
    });

    describe('resetState', () => {
      it('should reset searchTerm', () => {
        wrapper.setData({
          searchTerm: 'search',
        });
        wrapper.vm.resetState();
        expect(wrapper.vm.searchTerm).toEqual('');
      });

      it('should reset assignedTeams', () => {
        wrapper.setData({
          assignedTeams: [team],
          backupAssignedTeams: ['backup'],
        });
        wrapper.vm.resetState();
        expect(wrapper.vm.assignedTeams).toEqual(['backup']);
      });

      it('should reset assignedIndividuals', () => {
        wrapper.setData({
          assignedIndividuals: ['individual'],
          backupAssignedIndividuals: ['backup'],
        });
        wrapper.vm.resetState();
        expect(wrapper.vm.assignedIndividuals).toEqual(['backup']);
      });
    });
  });
});
