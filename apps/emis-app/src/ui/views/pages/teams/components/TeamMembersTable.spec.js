import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockTeamEntity, mockTeamMembersData,
} from '@libs/entities-lib/team';
import SelectUsersPopup from '@/ui/shared-components/SelectUsersPopup.vue';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';

import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import TeamMemberCaseFiles from '@/ui/views/pages/teams/components/TeamMemberCaseFiles.vue';

import { mockProvider } from '@/services/provider';
import routes from '@/constants/routes';
import Component from './TeamMembersTable.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);

const mockTeam = mockTeamEntity();

const userAccounts = [
  mockCombinedUserAccount({ id: 'guid-member-1' }),
  mockCombinedUserAccount({ id: 'guid-member-2' }),
  mockCombinedUserAccount({ id: 'guid-member-3' })];
userAccounts[0].metadata.caseFilesCount = 0;
userAccounts[1].metadata.caseFilesCount = 0;
userAccounts[2].metadata.caseFilesCount = 10;

const mockTeamMembers = [
  { ...userAccounts[0], isPrimaryContact: true },
  { ...userAccounts[1], isPrimaryContact: false },
  { ...userAccounts[2], isPrimaryContact: false },
];

describe('TeamMembersTable.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        teamId: 'abc',
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper(true, 5, {
        computed: {
          team() {
            return mockTeam;
          },
        },
      });
    });

    describe('Rendered elements', () => {
      describe('Add new member button', () => {
        it('is displayed if showAddMember is true', () => {
          const button = wrapper.findDataTest('add-new-member');
          expect(button.exists()).toBeTruthy();
        });

        it('is hidden if showAddMember is false', async () => {
          await wrapper.setProps({
            showAddMember: false,
          });
          const button = wrapper.find('[data-test="add-new-member"]');
          expect(button.exists()).toBeFalsy();
        });

        it('is disabled if disableAddMembers is true', async () => {
          await wrapper.setProps({
            disableAddMembers: true,
          });
          const button = wrapper.findDataTest('add-new-member');
          expect(button.props('disabled')).toBeTruthy();
        });

        it('is enabled if disableAddMembers is false', async () => {
          const button = wrapper.findDataTest('add-new-member');
          expect(button.props('disabled')).toBeFalsy();
        });
      });

      describe('Members data table', () => {
        it('is not rendered showMembers is false', async () => {
          await wrapper.setProps({ showMembers: false });

          const table = wrapper.findDataTest('teamMembers__table');
          expect(table.exists()).toBeFalsy();
        });

        it('is rendered if showMembers is true', async () => {
          await wrapper.setProps({ showMembers: true });
          const table = wrapper.findDataTest('teamMembers__table');
          expect(table.exists()).toBeTruthy();
        });

        it('displays the correct header values when in edit mode', async () => {
          const headers = wrapper.findAll('th');

          expect(headers.length).toBe(9);

          expect(headers.wrappers[0].find('span').text()).toBe('teams.member_name');
          expect(headers.wrappers[1].find('span').text()).toBe('teams.member_email');
          expect(headers.wrappers[2].find('span').text()).toBe('teams.phone_number');
          expect(headers.wrappers[3].find('span').text()).toBe('teams.member_role');
          expect(headers.wrappers[4].find('span').text()).toBe('teams.teams');
          expect(headers.wrappers[5].find('span').text()).toBe('teams.count_file.total');
          expect(headers.wrappers[6].find('span').text()).toBe('teams.count_file.open');
          expect(headers.wrappers[7].find('span').text()).toBe('teams.count_file.inactive');
          expect(headers.wrappers[7].find('span').text()).toBe('teams.count_file.inactive');
        });

        describe('Delete member', () => {
          beforeEach(async () => {
            await mountWrapper(true, 5, {
              computed: {
                filteredTeamMembers() {
                  return mockTeamMembers;
                },
              },
            });
          });

          test('clicking the bin will call handleRemoveTeamMember', async () => {
            jest.spyOn(wrapper.vm, 'handleRemoveTeamMember').mockImplementation(() => null);
            const button = wrapper.findDataTest('remove_team_member_guid-member-3');
            await button.trigger('click');
            expect(wrapper.vm.handleRemoveTeamMember).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('Add Team Members', () => {
        it('is shown only if showAddTeamMemberDialog is true', async () => {
          expect(wrapper.findComponent(SelectUsersPopup).exists()).toBeFalsy();

          await wrapper.setData({ showAddTeamMemberDialog: true });

          expect(wrapper.findComponent(SelectUsersPopup).exists()).toBeTruthy();
        });

        test('props preselected-ids is correctly linked to teamMembers', async () => {
          await wrapper.setData({ showAddTeamMemberDialog: true });
          const element = wrapper.findDataTest('add-team-members');
          expect(element.props().preselectedIds).toEqual(wrapper.vm.team.teamMembers.map((i) => i.id));
        });
      });

      describe('Search input', () => {
        it('is displayed if showSearch is true', async () => {
          expect(wrapper.findDataTest('search').exists()).toBeTruthy();
        });

        it('is hidden if showSearch is false', async () => {
          await wrapper.setProps({ showSearch: false });
          expect(wrapper.findDataTest('search').exists()).toBeFalsy();
        });
      });
    });

    describe('Event Handlers', () => {
      test('when the button is clicked the dialog is add team member dialog is shown', async () => {
        await wrapper.vm.$nextTick();
        const button = wrapper.find('[data-test="add-new-member"]');
        await button.trigger('click');
        expect(wrapper.vm.showAddTeamMemberDialog).toBeTruthy();
      });
    });

    describe('Team Member Case File', () => {
      it('should call onCloseCaseFileDialog when emit dialogClose', async () => {
        wrapper.vm.onCloseCaseFileDialog = jest.fn();
        await wrapper.setData({
          showMemberCaseFilesDialog: true,
          clickedMember: { ...userAccounts[0], isPrimaryContact: true },
        });
        await wrapper.vm.$nextTick();
        const component = wrapper.findComponent(TeamMemberCaseFiles);
        await component.vm.$emit('dialogClose');
        expect(wrapper.vm.onCloseCaseFileDialog).toHaveBeenCalled();
      });
    });

    describe('bulk-add-members-button, bulk-remove-members-button', () => {
      it('should be rendered when FF AddRemoveTeamMembers is on and user has L5', async () => {
        await mountWrapper(true, 5, {
          featureList: [wrapper.vm.$featureKeys.AddRemoveTeamMembers],
        });
        const addButton = wrapper.findDataTest('bulk-add-members-button');
        const removeButton = wrapper.findDataTest('bulk-remove-members-button');
        expect(addButton.exists()).toBeTruthy();
        expect(removeButton.exists()).toBeTruthy();
      });

      it('should not be rendered when FF AddRemoveTeamMembers is on but user has no L5', async () => {
        await mountWrapper(true, 4, {
          featureList: [wrapper.vm.$featureKeys.AddRemoveTeamMembers],
        });
        const addButton = wrapper.findDataTest('bulk-add-members-button');
        const removeButton = wrapper.findDataTest('bulk-remove-members-button');
        expect(addButton.exists()).toBeFalsy();
        expect(removeButton.exists()).toBeFalsy();
      });

      it('should not be rendered when FF AddRemoveTeamMembers is off but user has L5', async () => {
        await mountWrapper(true, 5, {
          featureList: [],
        });
        const addButton = wrapper.findDataTest('bulk-add-members-button');
        const removeButton = wrapper.findDataTest('bulk-remove-members-button');
        expect(addButton.exists()).toBeFalsy();
        expect(removeButton.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('filteredTeamMembers', () => {
      it('calls filterCollectionByValue with the right arguments and returns the result', async () => {
        sharedHelpers.filterCollectionByValue = jest.fn(() => mockTeamMembers);
        await mountWrapper();
        expect(sharedHelpers.filterCollectionByValue).toHaveBeenCalledWith(wrapper.vm.teamMembers, wrapper.vm.search, false, wrapper.vm.searchAmong, true);
        expect(wrapper.vm.filteredTeamMembers).toEqual(mockTeamMembers);
      });
    });

    describe('primaryContactId', () => {
      it('returns primary contact id if there is one', async () => {
        await mountWrapper();
        await wrapper.setProps({ primaryContact: mockCombinedUserAccount({ id: 'my-id' }) });
        expect(wrapper.vm.primaryContactId).toEqual('my-id');
      });

      it('returns the primary member id from team if none comes from props', async () => {
        const team = {
          ...mockTeam,
          teamMembers: [{ id: 'id-PC', isPrimaryContact: true }],
        };

        await mountWrapper(false, 5, {
          computed: {
            team: () => team,
          },
        });

        teamStore.getById = jest.fn(() => team);

        expect(wrapper.vm.primaryContactId).toEqual('id-PC');
      });
    });
  });

  describe('watch', () => {
    describe('primaryContact', () => {
      it('should call addMembers with the new primary contact, if it is not included in the team members list', async () => {
        await mountWrapper();
        await wrapper.setData({ team: { teamMembers: [{ id: '123abc', isPrimaryContact: true }] } });
        wrapper.vm.addMembers = jest.fn();
        await wrapper.setProps({ primaryContact: mockCombinedUserAccount({ id: 'new-id' }) });
        expect(wrapper.vm.addMembers).toHaveBeenCalledWith([{ id: 'new-id' }], false);
      });
    });

    describe('team', () => {
      it('calls loadTeamMembers if the old value was empty ', async () => {
        jest.spyOn(teamStore, 'getById').mockImplementationOnce(() => {});
        await mountWrapper();
        wrapper.vm.loadTeamMembers = jest.fn();
        await wrapper.setProps({ teamId: 'aaa' });
        expect(wrapper.vm.loadTeamMembers).toBeCalledTimes(1);
      });
    });

    describe('teamMembers', () => {
      it('emits an update to the team members data if the feature flag is on', async () => {
        await mountWrapper();
        wrapper.vm.$hasFeature = jest.fn(() => true);
        await wrapper.setData({ teamMembers: mockTeamMembers });
        expect(wrapper.emitted('update:teamMembersData')[0][0]).toEqual(wrapper.vm.teamMembers);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false, 5, {
        computed: {
          filteredTeamMembers() {
            return mockTeamMembers;
          },
          primaryContactId() {
            return 'pc-id';
          },
        },
      });
    });

    describe('loadTeamMembers', () => {
      it('calls helper callSearchInInBatches with the right payload ', async () => {
        sharedHelpers.callSearchInInBatches = jest.fn(() => ({ ids: ['1', '2'] }));
        await wrapper.setData({ team: { teamMembers: [{ id: 'id-1', isPrimaryContact: true }] } });
        await wrapper.vm.loadTeamMembers();

        expect(sharedHelpers.callSearchInInBatches).toHaveBeenCalledWith({
          service: wrapper.vm.combinedUserAccountStore,
          ids: ['id-1'],
          searchInFilter: { Entity: { Id: { in: '{ids}' } } },
          otherApiParameters: [null, false, true],
        });
      });

      it('calls userAccount getter , calls makeMappedMembers with the result of the userAccount getter and stores the result into teamMembers', async () => {
        sharedHelpers.callSearchInInBatches = jest.fn(() => ({ ids: ['search-id'] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        wrapper.vm.makeMappedMembers = jest.fn(() => mockTeamMembers);
        await wrapper.vm.loadTeamMembers();
        expect(wrapper.vm.combinedUserAccountStore.getByIds).toHaveBeenCalledWith(['search-id']);
        expect(wrapper.vm.makeMappedMembers).toHaveBeenCalledWith([mockCombinedUserAccount()]);
        expect(wrapper.vm.teamMembers).toEqual(mockTeamMembers);
      });
    });

    describe('removeTeamMember', () => {
      it('calls removeTeamMember action with correct params if argument is false', async () => {
        wrapper.vm.removeTeamMember('guid-member-1', false);
        expect(teamStore.removeTeamMember).toHaveBeenCalledWith({ teamId: 'abc', teamMemberId: 'guid-member-1' });
      });

      it('calls emptyTeam action with correct params if argument is true and emits reloadTeam', async () => {
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.removeTeamMember(null, true);
        expect(teamStore.emptyTeam).toHaveBeenCalledWith({ teamId: 'abc' });
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('reloadTeam');
      });

      it('filters out the removed team member from the rest of the team', async () => {
        await wrapper.setData({ teamMembers: mockTeamMembers });
        await wrapper.vm.removeTeamMember(mockTeamMembers[1].entity.id, false);
        expect(wrapper.vm.teamMembers).toEqual([{ ...userAccounts[0], isPrimaryContact: true },
          { ...userAccounts[2], isPrimaryContact: false }]);
      });
    });

    describe('canRemovePrimary', () => {
      it('returns true if the user has level 5 and the team has only one member', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team() {
              return mockTeam;
            },
          },
        });
        expect(wrapper.vm.canRemovePrimary()).toEqual(true);
      });

      it('returns false if  the user has less than level 5', async () => {
        await mountWrapper(false, 4, {
          computed: {
            team() {
              return mockTeam;
            },
          },
        });
        expect(wrapper.vm.canRemovePrimary()).toEqual(false);
      });

      it('returns false if  the team has more than one member', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team() {
              return { ...mockTeam.entity, teamMembers: mockTeamMembersData() };
            },
          },
        });
        expect(wrapper.vm.canRemovePrimary()).toEqual(false);
      });
    });

    describe('handleRemoveTeamMember', () => {
      it('calls confirm with the right message and calls empty team if deletion is confirmed, if user is deleting the primary contact and is allowed to', async () => {
        wrapper.vm.hasAssignedActiveCaseFiles = jest.fn(() => false);
        wrapper.vm.canRemovePrimary = jest.fn(() => true);
        wrapper.vm.$confirm = jest.fn(() => true);
        const item = mockTeamMembers[0];
        wrapper.vm.removeTeamMember = jest.fn();

        await wrapper.vm.handleRemoveTeamMember(item);

        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          messages: 'teams.remove_last_team_members_confirm',
          title: 'teams.remove_team_members',
        });
        expect(wrapper.vm.removeTeamMember).toBeCalledTimes(1);
      });

      it('shows the toaster warning if user is deleting the primary contact and is not allowed to', async () => {
        wrapper.vm.hasAssignedActiveCaseFiles = jest.fn(() => false);
        wrapper.vm.canRemovePrimary = jest.fn(() => false);
        const item = mockTeamMembers[0];
        wrapper.vm.$toasted.global.warning = jest.fn();

        await wrapper.vm.handleRemoveTeamMember(item);
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith('teams.remove_team_members_change_contact');
      });

      it('shows the right confirmation message if the user deletes a nonprimary contact and calls removeTeamMember if confirmed', async () => {
        const item = mockTeamMembers[1];
        wrapper.vm.hasAssignedActiveCaseFiles = jest.fn(() => false);
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.removeTeamMember = jest.fn();

        await wrapper.vm.handleRemoveTeamMember(item);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          messages: 'teams.remove_team_members_confirm',
          title: 'teams.remove_team_members',
        });
        expect(wrapper.vm.removeTeamMember).toBeCalledTimes(1);
      });
    });

    describe('showDeleteIcon', () => {
      test('only l5+ user can see the delete icon for a primary contact', async () => {
        await mountWrapper(false, 4);
        expect(wrapper.vm.showDeleteIcon({ isPrimaryContact: true })).toBeFalsy();

        await mountWrapper(false, 5);
        expect(wrapper.vm.showDeleteIcon({ isPrimaryContact: true })).toBeTruthy();
      });

      test('only l4+ can see the delete icon for other members', async () => {
        await mountWrapper(false, 3);
        expect(wrapper.vm.showDeleteIcon({ isPrimaryContact: false })).toBeFalsy();

        await mountWrapper(false, 4);
        expect(wrapper.vm.showDeleteIcon({ isPrimaryContact: false })).toBeTruthy();
      });
    });

    describe('viewMemberTeams', () => {
      it('sets the right values to the right variables', async () => {
        await wrapper.vm.viewMemberTeams(mockTeamMembers[0]);
        expect(wrapper.vm.showMemberTeamsDialog).toEqual(true);
        expect(wrapper.vm.clickedMember).toEqual(mockTeamMembers[0]);
      });
    });

    describe('viewMemberCaseFiles', () => {
      it('sets the right values to the right variables', async () => {
        await wrapper.vm.viewMemberCaseFiles(mockTeamMembers[0]);
        expect(wrapper.vm.showMemberCaseFilesDialog).toEqual(true);
        expect(wrapper.vm.clickedMember).toEqual(mockTeamMembers[0]);
      });
    });

    describe('makeMappedMembers', () => {
      it('returns a mapped version of the member passed in the argument', async () => {
        const member = mockCombinedUserAccount({
          id: 'pc-id',
          assignedCaseFileCountByTeam: [{
            teamId: wrapper.vm.teamId, openCaseFileCount: 10, inactiveCaseFileCount: 11, allCaseFileCount: 21,
          }],
        });

        const result = await wrapper.vm.makeMappedMembers([member]);
        expect(result).toEqual([{
          ...member,
          isPrimaryContact: true,
          openCaseFileCount: 10,
          inactiveCaseFileCount: 11,
          caseFileCount: 21,
        }]);
      });
    });

    describe('addMembers', () => {
      it('adds the new mapped member to the list of teamMembers', async () => {
        const newMembers = [mockCombinedUserAccount().entity];
        wrapper.vm.makeMappedMembers = jest.fn(() => [mockTeamMembers[1]]);
        wrapper.setData({ teamMembers: [mockTeamMembers[0]] });

        const userFromStore = mockCombinedUserAccount({ id: 'mynewguy' });
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [userFromStore]);
        await wrapper.vm.addMembers(newMembers);
        expect(wrapper.vm.combinedUserAccountStore.getByIds).toHaveBeenCalledWith([newMembers[0].id]);
        expect(wrapper.vm.makeMappedMembers).toHaveBeenCalledWith([userFromStore]);
        expect(wrapper.vm.teamMembers).toEqual([mockTeamMembers[0], mockTeamMembers[1]]);
      });

      it('calls addTeamMembers actions with correct parameters (selectedUsers) if no parameter passed (save by default)', async () => {
        const newMembers = [mockCombinedUserAccount().entity];
        await wrapper.vm.addMembers(newMembers);
        expect(teamStore.addTeamMembers).toHaveBeenCalledWith({ teamId: 'abc', teamMembers: [{ ...newMembers[0], isPrimaryContact: false }] });
      });

      it('doesnt call addTeamMembers actions if not saving', async () => {
        const newMembers = [mockCombinedUserAccount().entity];
        await wrapper.vm.addMembers(newMembers, false);
        expect(teamStore.addTeamMembers).not.toHaveBeenCalled();
      });
    });

    describe('onCloseCaseFileDialog', () => {
      it('should call loadTeamMembers and set showMemberCaseFilesDialog to false', async () => {
        await wrapper.setData({
          showMemberCaseFilesDialog: true,
          clickedMember: { ...userAccounts[0], isPrimaryContact: true },
        });
        wrapper.vm.loadTeamMembers = jest.fn();
        await wrapper.vm.onCloseCaseFileDialog();
        expect(wrapper.vm.loadTeamMembers).toHaveBeenCalled();
        expect(wrapper.vm.showMemberCaseFilesDialog).toEqual(false);
      });
    });

    describe('goToMassAddRemoveTeamMembers', () => {
      it('should redirect route with proper params', async () => {
        wrapper.vm.$router.push = jest.fn();
        await wrapper.setProps({
          teamId: 'team-id-1',
        });
        await wrapper.vm.goToMassAddRemoveTeamMembers('add');
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.massActions.addRemoveTeamMembers.create.name, query: { action: 'add', teamId: 'team-id-1' } });
      });
    });
  });
});
