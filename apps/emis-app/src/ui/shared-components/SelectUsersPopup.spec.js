import { RcDialog } from '@libs/component-lib/components';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockTeamMembersData } from '@libs/entities-lib/team';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import helpers from '@/ui/helpers/helpers';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';

import Component from './SelectUsersPopup.vue';

const localVue = createLocalVue();

const { pinia, userAccountStore } = useMockUserAccountStore();

describe('SelectUsersPopup.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        preselectedIds: mockTeamMembersData().map((u) => u.id),
        title: 'title',
        topSearchTitle: 'topSearchTitle',
        topSelectedTitle: 'topSelectedTitle',
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
        ]);
      });
    });

    describe('filteredUsers', () => {
      it('returns a mapped list of those users', async () => {
        const tm = mockCombinedUserAccount();
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [mockCombinedUserAccount()]);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUsers).toEqual([
          {
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
        jest.spyOn(wrapper.vm, 'isAlreadySelected').mockImplementation(() => true);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadySelected').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadySelected').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('isAlreadySelected', () => {
      it('returns true if the user is already in the team', () => {
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.isAlreadySelected(user)).toBeTruthy();
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
        expect(wrapper.vm.isAlreadySelected(user)).toBeFalsy();
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
      it('calls the search endpoint with the right data when no role and default props', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn();
        helpers.toQuickSearchSql = jest.fn(() => ({
          and: [
            { 'metadata/searchableText': { contains: 'test' } },
          ],
        }));
        await wrapper.vm.fetchFilteredUsers();
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          orderBy: 'Metadata/DisplayName',
          filter: {
            and: [
              { 'metadata/searchableText': { contains: 'test' } },
            ],
          },
          top: null,
        }, null, false, true);
      });

      it('calls the search endpoint with the right data when no role but props', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn();
        helpers.toQuickSearchSql = jest.fn(() => ({
          and: [
            { 'metadata/searchableText': { contains: 'test' } },
          ],
        }));
        await wrapper.setProps({ maxNbResults: 3 });

        await wrapper.vm.fetchFilteredUsers();
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          orderBy: 'Metadata/DisplayName',
          filter: {
            and: [
              { 'metadata/searchableText': { contains: 'test' } },
            ],
          },
          top: 3,
        }, null, false, true);
      });

      it('calls the search endpoint with the right data when role', async () => {
        sharedHelpers.callSearchInInBatches = jest.fn(() => ({ ids: ['id-1'] }));
        wrapper.vm.combinedUserAccountStore.search = jest.fn();
        await wrapper.setProps({ levels: ['l3', 'l4'], maxNbResults: 3 });
        await wrapper.setData({
          search: 'test',
        });

        userAccountStore.rolesByLevels = jest.fn(() => [{ name: 'role1', id: 'id-1' }]);

        await wrapper.vm.fetchFilteredUsers();
        expect(sharedHelpers.callSearchInInBatches).toHaveBeenCalledWith({
          ids: ['id-1'],
          searchInFilter: 'Metadata/RoleName/Id in ({ids})',
          otherOptions: {
            top: 3,
            orderBy: 'Metadata/DisplayName',
          },
          service: wrapper.vm.combinedUserAccountStore,
          otherFilter: 'contains(Metadata/DisplayName, \'test\')',
          otherApiParameters: [null, false, true],
        });
      });

      it('stores the result from search into filteredUsersIds', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: ['id-1'] }));
        helpers.toQuickSearch = jest.fn();
        await wrapper.vm.fetchFilteredUsers();
        expect(wrapper.vm.filteredUsersIds).toEqual(['id-1']);
      });
    });

    describe('submit', () => {
      it('emits submit with the right value', async () => {
        wrapper.setData({ selectedUsers: [{ id: 'id-1' }, { id: 'id-2' }] });
        await wrapper.vm.submit();
        expect(wrapper.emitted('submit')[0][0]).toEqual([{ id: 'id-1' }, { id: 'id-2' }]);
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
