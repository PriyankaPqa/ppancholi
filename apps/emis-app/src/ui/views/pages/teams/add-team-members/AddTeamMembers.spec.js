import { RcDialog } from '@libs/component-lib/components';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockTeamMembersData } from '@libs/entities-lib/team';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import helpers from '@/ui/helpers/helpers';
import Component from './AddTeamMembers.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AddTeamMembers.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        teamMembers: mockTeamMembersData(),
        teamId: 'abc',
      },
      store: {
        modules: {
          team: {
            state: {
              submitLoading: true,
            },
          },
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('RcDialog', () => {
      describe('submit button', () => {
        it('is disabled if no selected members', () => {
          const component = wrapper.findComponent(RcDialog);
          expect(component.props('submitButtonDisabled')).toEqual(true);
        });

        it('is enabled if at least one selected members', async () => {
          const component = wrapper.findComponent(RcDialog);
          await wrapper.setData({
            selectedUsers: [{}],
          });
          expect(component.props('submitButtonDisabled')).toEqual(false);
        });
      });
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'teams.member_name',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'displayName',
          },
          {
            text: 'teams.member_email',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: 'emailAddress',
          },
          {
            text: 'teams.member_role',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: 'role',
          },
          {
            text: 'teams.member_status',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: '',
          },
        ]);
      });
    });

    describe('filteredUsers', () => {
      it('returns a mapped list of those users', async () => {
        const tm = mockCombinedUserAccount();
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUsers).toEqual([
          {
            isPrimaryContact: false,
            roleName: tm.metadata.roleName,
            displayName: tm.metadata.displayName,
            id: tm.entity.id,
            emailAddress: tm.metadata.emailAddress,
          },
        ]);
      });
    });
  });

  describe('watch', () => {
    describe('search', () => {
      it('calls debounce search with the trimmed searched query', async () => {
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.setData({
          search: 'query    ',
        });
        expect(wrapper.vm.debounceSearch).toHaveBeenCalledWith('query');
      });
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emit update:show with false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('getClassRow', () => {
      it('returns row_disabled if the user is already in the team', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => true);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('isAlreadyInTeam', () => {
      it('returns true if the user is already in the team', () => {
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.isAlreadyInTeam(user)).toBeTruthy();
      });

      it('returns false if the user does not belong to the team', () => {
        const user = {
          id: '5',
          displayName: 'Test Brown',
          givenName: 'TEst',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test@test.com',
          roles: [],
        };
        expect(wrapper.vm.isAlreadyInTeam(user)).toBeFalsy();
      });
    });

    describe('isSelected', () => {
      it('returns true if the user is being selected', () => {
        const user = mockTeamMembersData()[0];
        wrapper.vm.selectedUsers = mockTeamMembersData();
        expect(wrapper.vm.isSelected(user)).toBeTruthy();
      });

      it('returns false if the user is not selected', () => {
        const user = mockTeamMembersData()[0];
        wrapper.vm.selectedUsers = [];
        expect(wrapper.vm.isSelected(user)).toBeFalsy();
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        wrapper.vm.selectedUsers = mockTeamMembersData();
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'TEst',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            roles: [],
          },
        ];
        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...mockTeamMembersData(), ...items]);
      });

      it('updates selectedUsers by removing unselected members', () => {
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'TEst',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            roles: [],
          },
        ];
        wrapper.vm.selectedUsers = [...mockTeamMembersData(), ...items];
        wrapper.vm.onSelectAll({ items, value: false });
        expect(wrapper.vm.selectedUsers).toEqual(mockTeamMembersData());
      });
    });

    describe('fetchFilteredUsers', () => {
      it('calls the search endpoint with the right data', async () => {
        wrapper.vm.$storage.userAccount.actions.search = jest.fn();
        helpers.toQuickSearch = jest.fn(() => 'query from helper');
        await wrapper.vm.fetchFilteredUsers();
        expect(wrapper.vm.$storage.userAccount.actions.search).toHaveBeenCalledWith({
          search: 'query from helper',
          queryType: 'full',
          searchMode: 'all',
        });
      });

      it('stores the result from search into filteredUsersIds', async () => {
        wrapper.vm.$storage.userAccount.actions.search = jest.fn(() => ({ ids: ['id-1'] }));
        helpers.toQuickSearch = jest.fn();
        await wrapper.vm.fetchFilteredUsers();
        expect(wrapper.vm.filteredUsersIds).toEqual(['id-1']);
      });
    });

    describe('submit', () => {
      it('calls addTeamMembers actions with correct parameters (selectedUsers)', async () => {
        await wrapper.vm.submit();
        expect(storage.team.actions.addTeamMembers).toHaveBeenCalledWith('abc', wrapper.vm.selectedUsers);
      });

      it('calls close method', async () => {
        jest.spyOn(wrapper.vm, 'close').mockImplementation(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });

      it('emits addMembers with the right value', async () => {
        wrapper.setData({ selectedUsers: [{ id: 'id-1' }, { id: 'id-2' }] });
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [{ id: 'm-1' }, { id: 'm-2' }]);
        await wrapper.vm.submit();
        expect(wrapper.vm.$storage.userAccount.getters.getByIds).toHaveBeenCalledWith(['id-1', 'id-2']);
        expect(wrapper.emitted('addMembers')[0][0]).toEqual([{ id: 'm-1' }, { id: 'm-2' }]);
      });
    });

    describe('debounceSearch', () => {
      it('should call fetchFilteredUsers', async () => {
        wrapper.vm.fetchFilteredUsers = jest.fn();
        wrapper.vm.debounceSearch();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));
        expect(wrapper.vm.fetchFilteredUsers).toHaveBeenCalledTimes(1);
      });
    });
  });
});
