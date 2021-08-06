/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockCombinedTeams,
} from '@/entities/team';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import { mockStorage } from '@/store/storage';
import { mockCombinedUserAccount } from '@/entities/user-account';
import Component from './TeamMembersTable.vue';
import _orderBy from 'lodash/orderBy';

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

const mockTeamMembers = [{...userAccounts[0], isPrimaryContact: true}, {...userAccounts[1], isPrimaryContact: false}, {...userAccounts[2], isPrimaryContact: false}];

describe('TeamMembersTable.vue', () => {
  
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        teamId: 'abc',
      },
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
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

          test('clicking the bin will show remove confirmation dialog if not a primary contact', async () => {
            jest.spyOn(wrapper.vm, 'showRemoveConfirmationDialog').mockImplementation(() => null);
            const button = wrapper.findDataTest('remove_team_member_guid-member-2');
            await button.trigger('click');
            expect(wrapper.vm.showRemoveConfirmationDialog).toHaveBeenCalledTimes(1);
          });

          test('clicking the bin will call showPrimaryContactMessage if primary contact', async () => {
            jest.spyOn(wrapper.vm, 'showPrimaryContactMessage').mockImplementation(() => null);

            const button = wrapper.findDataTest('remove_team_member_guid-member-1');
            await button.trigger('click');
            expect(wrapper.vm.showPrimaryContactMessage).toHaveBeenCalledTimes(1);
          });
          test('clicking the bin will call showRemoveConfirmationDialogWithCaseFiles if has case files', async () => {
            jest.spyOn(wrapper.vm, 'showRemoveConfirmationDialogWithCaseFiles').mockImplementation(() => null);

            const button = wrapper.findDataTest('remove_team_member_guid-member-3');
            await button.trigger('click');
            expect(wrapper.vm.showRemoveConfirmationDialogWithCaseFiles).toHaveBeenCalledTimes(1);
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

      describe('Delete confirmation dialog', () => {
        test('submit is linked to removeTeamMember', async () => {
          wrapper.vm.showRemoveMemberConfirmationDialog = true;
          await wrapper.vm.$nextTick();
          jest.spyOn(wrapper.vm, 'removeTeamMember').mockImplementation(() => true);

          const element = wrapper.findDataTest('removeTeamMember_confirmDialog');
          element.vm.$emit('submit');

          expect(wrapper.vm.removeTeamMember).toHaveBeenCalledTimes(1);
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

    describe('showRemoveConfirmationDialog', () => {
      it('assigns removeMemberId', () => {
        wrapper.vm.showRemoveConfirmationDialog('123');
        expect(wrapper.vm.removeMemberId).toBe('123');
      });

      it('sets showRemoveMemberConfirmationDialog to true', () => {
        expect(wrapper.vm.showRemoveMemberConfirmationDialog).toBeFalsy();
        wrapper.vm.showRemoveConfirmationDialog('123');
        expect(wrapper.vm.showRemoveMemberConfirmationDialog).toBeTruthy();
      });
      it('sets hasCaseFiles to false', async () => {
        await wrapper.setData({
          hasCaseFiles: true,
        });
        wrapper.vm.showRemoveConfirmationDialog('123');
        expect(wrapper.vm.hasCaseFiles).toBeFalsy();
      });
    });
    describe('showRemoveConfirmationDialogWithCaseFiles', () => {
      it('assigns removeMemberId', () => {
        wrapper.vm.showRemoveConfirmationDialogWithCaseFiles('123');
        expect(wrapper.vm.removeMemberId).toBe('123');
      });

      it('sets showRemoveMemberConfirmationDialog to true', () => {
        expect(wrapper.vm.showRemoveMemberConfirmationDialog).toBeFalsy();
        wrapper.vm.showRemoveConfirmationDialogWithCaseFiles('123');
        expect(wrapper.vm.showRemoveMemberConfirmationDialog).toBeTruthy();
      });

      it('sets hasCaseFiles to true', () => {
        expect(wrapper.vm.hasCaseFiles).toBeFalsy();
        wrapper.vm.showRemoveConfirmationDialogWithCaseFiles('123');
        expect(wrapper.vm.hasCaseFiles).toBeTruthy();
      });
    });

    describe('hideConfirmationDialog', () => {
      it('remove member confirmation dialog', () => {
        jest.spyOn(wrapper.vm, 'showRemoveConfirmationDialog').mockImplementation(() => null);
        wrapper.vm.handleRemoveTeamMember(wrapper.vm.computedTeamMembers[1]);
        expect(wrapper.vm.showRemoveConfirmationDialog).toHaveBeenCalledWith(wrapper.vm.computedTeamMembers[1].entity.id);
      });
    });

    describe('removeTeamMember', () => {
      it('calls removeTeamMember action with correct params', async () => {
        await wrapper.setData({
          removeMemberId: 'guid-member-1',
        });
        wrapper.vm.removeTeamMember();
        expect(storage.team.actions.removeTeamMember).toHaveBeenCalledWith('abc', 'guid-member-1');
      });

      describe('handleRemoveTeamMember', () => {
        it('called showPrimaryContactMessage if user is a primary contact', () => {
          jest.spyOn(wrapper.vm, 'showPrimaryContactMessage').mockImplementation(() => null);
          wrapper.vm.handleRemoveTeamMember(wrapper.vm.computedTeamMembers[0]);
          expect(wrapper.vm.showPrimaryContactMessage).toHaveBeenCalledTimes(1);
        });

        it('called showRemoveConfirmationDialog if open case files count is zero', () => {
          jest.spyOn(wrapper.vm, 'showRemoveConfirmationDialog').mockImplementation(() => null);
          wrapper.vm.handleRemoveTeamMember(wrapper.vm.computedTeamMembers[1]);
          expect(wrapper.vm.showRemoveConfirmationDialog).toHaveBeenCalledWith(wrapper.vm.computedTeamMembers[1].entity.id);
        });

        it('called showRemoveConfirmationDialogWithCaseFiles if user has case file linked', () => {
          jest.spyOn(wrapper.vm, 'showRemoveConfirmationDialogWithCaseFiles').mockImplementation(() => null);
          wrapper.vm.handleRemoveTeamMember(wrapper.vm.computedTeamMembers[2]);
          expect(wrapper.vm.showRemoveConfirmationDialogWithCaseFiles).toHaveBeenCalledWith(wrapper.vm.computedTeamMembers[2].entity.id);
        });
      });
    });

    describe('showPrimaryContactMessage', () => {
      it('should display a warning notification', () => {
        wrapper.vm.showPrimaryContactMessage();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenLastCalledWith('teams.remove_team_members_change_contact');
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
  });
});
