import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockCombinedTeams, mockTeamMembersData,
} from '@libs/entities-lib/team';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import { mockStorage } from '@/storage';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import _orderBy from 'lodash/orderBy';
import Component from './TeamMembersTable.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const mockTeam = mockCombinedTeams()[0];

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
      propsData: {
        teamId: 'abc',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

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

        test('items props is linked to computedTeamMembers', async () => {
          const element = wrapper.findDataTest('teamMembers__table');
          expect(element.props().items).toEqual(wrapper.vm.computedTeamMembers);
        });

        describe('Delete member', () => {
          beforeEach(async () => {
            await mountWrapper(true, 5, {
              computed: {
                computedTeamMembers() {
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
          expect(wrapper.findComponent(AddTeamMembers).exists()).toBeFalsy();

          await wrapper.setData({ showAddTeamMemberDialog: true });

          expect(wrapper.findComponent(AddTeamMembers).exists()).toBeTruthy();
        });

        test('props teamMembers is correctly linked', async () => {
          await wrapper.setData({ showAddTeamMemberDialog: true });
          const element = wrapper.findDataTest('add-team-members');
          expect(element.props().teamMembers).toEqual(wrapper.vm.team.entity.teamMembers);
          expect(element.props().teamId).toEqual(wrapper.vm.team.entity.id);
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
  });

  describe('Computed', () => {
    describe('computedTeamMembers', () => {
      it('returns sorted filtered list from getById', async () => {
        await mountWrapper(false, 5);
        await wrapper.setData({
          search: 'Jane',
          sortBy: 'id',
          sortDesc: false,
        });

        expect(storage.userAccount.getters.getByIds).toHaveBeenCalledWith(wrapper.vm.team.entity.teamMembers.map((x) => x.id));
        expect(wrapper.vm.computedTeamMembers.map((x) => x.entity.id)).toEqual(storage.userAccount.getters.getByIds().map((x) => x.entity.id));

        await wrapper.setData({
          search: 'Jane',
          sortBy: 'id',
          sortDesc: true,
        });
        expect(wrapper.vm.computedTeamMembers.map((x) => x.entity.id)).toEqual(_orderBy(storage.userAccount.getters.getByIds().map((x) => x.entity.id), 'id', 'desc'));

        await wrapper.setData({
          search: '[nope]',
          sortBy: 'displayName',
        });

        expect(wrapper.vm.computedTeamMembers.map((x) => x.entity.id)).toEqual([]);
      });
    });

    describe('caseFileCount', () => {
      it('returns the right assigned case file count object', async () => {
        const caseFileCount = {
          teamId: 'abc', openCaseFileCount: 10, closedCaseFileCount: 2, inactiveCaseFileCount: 3, allCaseFileCount: 15,
        };

        await mountWrapper(false, 6, {
          computed: {
            computedTeamMembers() {
              return [{
                ...mockCombinedUserAccount({ id: 'guid-member-1' }),
                isPrimaryContact: true,
                metadata: {
                  ...userAccounts[0].metadata,
                  assignedCaseFileCountByTeam: [caseFileCount],
                },
              }];
            },
          },
        });

        expect(wrapper.vm.caseFileCount('guid-member-1')).toEqual(caseFileCount);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false, 5, {
        computed: {
          computedTeamMembers() {
            return mockTeamMembers;
          },
        },
      });
    });

    describe('removeTeamMember', () => {
      it('calls removeTeamMember action with correct params if argument is false', async () => {
        wrapper.vm.removeTeamMember('guid-member-1', false);
        expect(storage.team.actions.removeTeamMember).toHaveBeenCalledWith('abc', 'guid-member-1');
      });

      it('calls emptyTeam action with correct params if argument is true and emits reloadTeam', async () => {
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.removeTeamMember(null, true);
        expect(storage.team.actions.emptyTeam).toHaveBeenCalledWith('abc');
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('reloadTeam');
      });
    });

    describe('canRemovePrimary', () => {
      it('returns true if the feature flag is on, the user has level 5 and the team has only one member', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team() {
              return mockTeam;
            },
          },
        });
        wrapper.vm.$hasFeature = jest.fn(() => true);
        expect(wrapper.vm.canRemovePrimary()).toEqual(true);
      });

      it('returns false if the feature flag is off', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team() {
              return mockTeam;
            },
          },
        });
        wrapper.vm.$hasFeature = jest.fn(() => false);
        expect(wrapper.vm.canRemovePrimary()).toEqual(false);
      });

      it('returns false if  the user has less than level 5', async () => {
        await mountWrapper(false, 4, {
          computed: {
            team() {
              return mockTeam;
            },
          },
        });
        wrapper.vm.$hasFeature = jest.fn(() => true);
        expect(wrapper.vm.canRemovePrimary()).toEqual(false);
      });

      it('returns false if  the team has more than one member', async () => {
        await mountWrapper(false, 5, {
          computed: {
            team() {
              return { ...mockTeam, entity: { ...mockTeam.entity, teamMembers: mockTeamMembersData() } };
            },
          },
        });
        wrapper.vm.$hasFeature = jest.fn(() => true);
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
  });
});
