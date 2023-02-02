import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockAssignedTeamMembers, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { mockTeamEntity, TeamType, mockTeamMembersData } from '@libs/entities-lib/team';
import { mockStorage } from '@/storage';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import Component from '../case-file-activity/components/AssignCaseFile.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCaseFileEntity();
const team = { ...mockTeamEntity(), activeMemberCount: 1 };
const { pinia } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);

const individual = (id = 'mock-id-1', otherProps = {}) => (
  {
    ...mockCombinedUserAccount({ id }),
    assignedTeamId: null,
    assignedTeamName: null,
    ...otherProps,
  });

teamStore.getTeamsAssignable = jest.fn(() => [mockTeamEntity()]);

describe('AssignCaseFile.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        localVue,
        pinia,
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
      it('renders', async () => {
        await wrapper.setData({ currentTeam: { id: '1' } });
        const element = wrapper.findDataTest('individuals-table');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          caseFile: mockCaseFile,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('customColumns', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.customColumns).toEqual({
          displayName: 'Metadata/DisplayName',
          role: 'Metadata/RoleName/Translation/en',
          assign: 'assign',
        });
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
            value: 'Metadata/DisplayName',
          },
          {
            text: 'teams.member_role',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'Metadata/RoleName/Translation/en',
          },
          {
            text: 'caseFile.assign.assign',
            class: 'team_member_header',
            sortable: false,
            value: 'assign',
          },
        ]);
      });
    });

    describe('tableData', () => {
      it(' returns the right value', () => {
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount({ id: 'mock-id-1' })]);
        expect(wrapper.vm.tableData).toEqual([mockCombinedUserAccount({ id: 'mock-id-1' })]);
      });
    });

    describe('orderedAssignedMembers', () => {
      it('returns the  assigned members ordered by team and name', async () => {
        const i1 = individual('1', { assignedTeamName: 'bb', metadata: { displayName: 'bb' } });
        const i2 = individual('2', { assignedTeamName: 'aa', metadata: { displayName: 'cc' } });
        const i3 = individual('3', { assignedTeamName: 'aa', metadata: { displayName: 'aa' } });

        await wrapper.setData({ assignedIndividuals: [i1, i2, i3] });
        expect(wrapper.vm.orderedAssignedMembers).toEqual([i3, i2, i1]);
      });
    });
  });

  describe('watch', () => {
    it('goes to first page and calls search if the current team changes ', async () => {
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
      wrapper.vm.search = jest.fn();
      wrapper.vm.goToFirstPage = jest.fn();
      await wrapper.setData({ currentTeam: { id: 1 }, params: { search: 'query' } });
      jest.clearAllMocks();
      await wrapper.setData({ currentTeam: { id: 2 } });
      expect(wrapper.vm.goToFirstPage).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.search).toHaveBeenCalledWith({ search: 'query' });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(async () => {
        teamStore.searchAggregatedTeams = jest.fn(() => []);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            caseFile: mockCaseFile,
            show: true,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.getTeamsData = jest.fn();
        wrapper.vm.initialLoadTeamMembers = jest.fn();
        wrapper.vm.setAssignedTeams = jest.fn();
        wrapper.vm.setAssignedIndividuals = jest.fn();
        wrapper.vm.backupState = jest.fn();
      });

      it('calls getTeamsData', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.getTeamsData).toHaveBeenCalledTimes(1);
      });

      it('calls loadTeamMembers', async () => {
        jest.clearAllMocks();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initialLoadTeamMembers).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedTeams', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignedTeams).toHaveBeenCalledTimes(1);
      });

      it('calls setAssignedIndividuals', async () => {
        jest.clearAllMocks();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignedIndividuals).toHaveBeenCalledTimes(1);
      });

      it('calls backupState', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.backupState).toHaveBeenCalledTimes(1);
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
        expect(teamStore.getTeamsAssignable).toHaveBeenCalledWith(mockCaseFile.eventId);
      });

      it('sets the right value into allTeams', async () => {
        await wrapper.vm.getTeamsData();
        expect(wrapper.vm.allTeams).toEqual([{ ...mockTeamEntity(), activeMemberCount: 0 }]);
      });
    });

    describe('initialLoadTeamMembers', () => {
      it('calls fetchTeamMembersCount for each team in allTeams', async () => {
        wrapper.vm.fetchTeamMembersCount = jest.fn();
        await wrapper.setData({ allTeams: [{ id: 'id-1' }, { id: 'id-2' }] });
        await wrapper.vm.initialLoadTeamMembers();
        expect(wrapper.vm.fetchTeamMembersCount).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.fetchTeamMembersCount).toHaveBeenCalledWith({ id: 'id-1' });
        expect(wrapper.vm.fetchTeamMembersCount).toHaveBeenCalledWith({ id: 'id-2' });
      });
    });

    describe('fetchTeamMembersCount', () => {
      it('calls fetchUserAccounts with the id of the team in the argument and updates the activeMemberCount of the team', async () => {
        wrapper.vm.fetchUserAccounts = jest.fn(() => ({ count: 10 }));
        await wrapper.vm.fetchTeamMembersCount(team);
        expect(wrapper.vm.fetchUserAccounts).toHaveBeenCalledWith(team.id, {}, true);
        expect(team).toEqual({ ...team, activeMemberCount: 10 });
      });
    });

    describe('fetchData', () => {
      it('calls fetchUserAccounts with the right params', async () => {
        await wrapper.setData({ currentTeam: { id: 'id-1' } });

        wrapper.vm.fetchUserAccounts = jest.fn();
        await wrapper.vm.fetchData({ filter: 'filter' });
        expect(wrapper.vm.fetchUserAccounts).toHaveBeenCalledWith('id-1', { filter: 'filter' });
      });
    });

    describe('fetchUserAccounts', () => {
      it('calls userAccount search with the right payload when initialLoad is true', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: ['search-id'] }));

        const result = await wrapper.vm.fetchUserAccounts('id-1', {}, true);
        const filter = {
          Metadata: {
            Teams: {
              any: {
                TeamId: 'id-1',
              },
            },
          },
        };

        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith(
          {
            filter,
            top: 1,
            skip: 0,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          },
        );
        expect(result).toEqual({ ids: ['search-id'] });
      });

      it('calls userAccount search with the right payload when initialLoad is not true', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: ['search-id'] }));
        wrapper.setData({ searchTerm: 'query' });

        const result = await wrapper.vm.fetchUserAccounts('id-1', {
          top: 10, skip: 10, orderBy: 'mock',
        });

        const filter = {
          Metadata: {
            Teams: {
              any: {
                TeamId: 'id-1',
              },
            },
          },
        };

        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith(
          {
            filter,
            search: 'Metadata/DisplayName:/.*query.*/ OR Metadata/DisplayName:"\\"query\\""',
            top: 10,
            skip: 10,
            count: true,
            orderBy: 'mock',
            queryType: 'full',
            searchMode: 'all',
          },
        );
        expect(result).toEqual({ ids: ['search-id'] });
      });
    });

    describe('setAssignedIndividuals', () => {
      it('calls fetchAssignedIndividualsData and updates assignedIndividuals with the mapped returned data', async () => {
        await wrapper.setData({
          caseFile: { assignedTeamMembers: [{ teamMembersIds: ['id-1'], teamId: 'team-id-1' }, { teamId: 'team-id-2', teamMembersIds: ['id-2'] }] },
          allTeams: [{ id: 'team-id-1', name: 'Team1' }, { id: 'team-id-2', name: 'Team2' }],
        });

        wrapper.vm.fetchAssignedIndividualsData = jest.fn(() => [
          individual('id-1', { metadata: { displayName: 'Jane Smith' } }),
          individual('id-2', { metadata: { displayName: 'Joe White' } }),
        ]);

        await wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.assignedIndividuals).toEqual([
          individual('id-1', { metadata: { displayName: 'Jane Smith' }, assignedTeamId: 'team-id-1', assignedTeamName: 'Team1' }),
          individual('id-2', { metadata: { displayName: 'Joe White' }, assignedTeamId: 'team-id-2', assignedTeamName: 'Team2' }),
        ]);
      });
    });

    describe('fetchAssignedIndividualsData', () => {
      it('calls userAccount getter and stores the result into teamMembers', async () => {
        await wrapper.setData({ caseFile: { assignedTeamMembers: [{ teamMembersIds: ['id-1', 'id-2'] }, { teamMembersIds: ['id-3'] }] } });
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: ['search-id'] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);

        const result = await wrapper.vm.fetchAssignedIndividualsData();
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['id-1', 'id-2', 'id-3'] } } },
          queryType: 'full',
          searchMode: 'all',
        });
        expect(wrapper.vm.combinedUserAccountStore.getByIds).toHaveBeenCalledWith(['search-id']);
        expect(result).toEqual([mockCombinedUserAccount()]);
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

    describe('isUserSelected', () => {
      it('returns true if the user assigned team id is the same as the current team id', async () => {
        const i = individual('1', { assignedTeamId: 'team-id-1' });
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [i] });
        expect(wrapper.vm.isUserSelected(i)).toBeTruthy();
      });

      it('returns false if the user assigned team id is not the same as the current team id', async () => {
        const i = individual('', { assignedTeamId: 'team-id-2' });
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [i] });
        expect(wrapper.vm.isUserSelected(i)).toBeFalsy();
      });

      it('returns false if there is no assigned user', async () => {
        const i = individual();
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [] });
        expect(wrapper.vm.isUserSelected(i)).toBeFalsy();
      });
    });

    describe('isUserDisabled', () => {
      it('returns true if the user assigned team id exists and is not the same as the current team id', async () => {
        const i = individual('1', { assignedTeamId: 'team-id-2' });
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [i] });
        expect(wrapper.vm.isUserDisabled(i)).toBeTruthy();
      });

      it('returns false if the user assigned team id is the same as the current team id', async () => {
        const i = individual('', { assignedTeamId: 'team-id-1' });
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [i] });
        expect(wrapper.vm.isUserDisabled(i)).toBeFalsy();
      });

      it('returns false if there are no assigned individuals', async () => {
        const i = individual();
        await wrapper.setData({ currentTeam: { id: 'team-id-1' }, assignedIndividuals: [] });
        expect(wrapper.vm.isUserDisabled(i)).toBeFalsy();
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

        wrapper.vm.assignedIndividuals = [individual('1', { assignedTeamId: 'team-id-1' })];
        wrapper.vm.assignedTeams = teams;
        await wrapper.vm.submit();
        expect(wrapper.emitted('updateAssignmentsInfo')[0][0]).toEqual({ teams, individuals: [individual('1', { assignedTeamId: 'team-id-1' })] });
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
      it('should assign an individual', async () => {
        await wrapper.setData({
          currentTeam: { id: '1', name: 'team1' },
          assignedIndividuals: [],
        });
        const i1 = individual('id-1');
        await wrapper.vm.assignIndividual(i1);
        expect(wrapper.vm.assignedIndividuals).toEqual([{ ...i1, assignedTeamId: '1', assignedTeamName: 'team1' }]);
      });
    });

    describe('unAssignIndividual', () => {
      it('should unassign an individual', async () => {
        const i1 = individual('id-1');
        const i2 = individual('id-2');

        await wrapper.setData({
          assignedIndividuals: [i1, i2],
          currentTeam: { id: '1', name: 'team1' },
        });
        wrapper.vm.unAssignIndividual(i1);
        expect(wrapper.vm.assignedIndividuals).toEqual([i2]);
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
          individual('i1', { assignedTeamId: 't1' }),
          individual('i2', { assignedTeamId: 't1' }),
          individual('i3', { assignedTeamId: 't2' }),

        ];
        const res = wrapper.vm.prepareTeamMembersPayload(users);
        expect(res).toEqual([
          {
            teamId: 't1', teamMembersIds: ['i1', 'i2'],
          },
          {
            teamId: 't2', teamMembersIds: ['i3'],
          },
        ]);
      });
    });

    describe('backupState', () => {
      it('should backup assigned teams', () => {
        wrapper.setData({
          assignedTeams: [team],
        });
        expect(wrapper.vm.backupAssignedTeams).toEqual([]);
        wrapper.vm.backupState();
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
        wrapper.vm.backupState();
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
