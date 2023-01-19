import userAccountsFilter from '@/ui/mixins/userAccountsFilter';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { UserRolesNames } from '@libs/entities-lib/user';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';

const Component = {
  render() {},
  mixins: [userAccountsFilter],
};

const localVue = createLocalVue();
const user = mockCombinedUserAccount();
let wrapper;

describe('userAccountsFilter', () => {
  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('fetchUsers', () => {
      it(' calls the getter rolesByLevels with the right payload', async () => {
        await wrapper.setData({ userAccountFilterState: { to: { levels: [UserRolesNames.level3, UserRolesNames.level4] } } });
        wrapper.vm.$storage.userAccount.getters.rolesByLevels = jest.fn(() => []);
        wrapper.vm.fetchUsers('', 'to');
        expect(wrapper.vm.$storage.userAccount.getters.rolesByLevels).toHaveBeenCalledWith([UserRolesNames.level3, UserRolesNames.level4]);
      });

      it('calls fetchUsersFilter and stores the response into the right data property', async () => {
        await wrapper.setData({ userAccountFilterState: { to: { levels: [UserRolesNames.level3, UserRolesNames.level4] } } });
        wrapper.vm.fetchUsersFilter = jest.fn(() => [mockCombinedUserAccount({ id: '1', displayName: 'a' })]);
        wrapper.vm.$storage.userAccount.getters.rolesByLevels = jest.fn(() => [{ name: 'role1', id: 'id-1' }]);
        wrapper.setData({ userAccountFilterState: { to: { selectedUsers: [{ name: 'b', id: '2' }] } } });
        await wrapper.vm.fetchUsers('search', 'to', 10);

        expect(wrapper.vm.fetchUsersFilter).toHaveBeenCalledWith('search', ['id-1'], 10);
        expect(wrapper.vm.userAccountFilterState.to.users).toEqual([{ text: 'a', value: '1' }, { name: 'b', id: '2' }]);
      });
    });

    describe('fetchUsersByIds', () => {
      it('should call searchUserAccount with the right params', async () => {
        wrapper.vm.searchUserAccount = jest.fn();
        await wrapper.vm.fetchUsersByIds(['id']);
        expect(wrapper.vm.searchUserAccount).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['id'] } } },
          top: 999,
        });
      });
    });

    describe('searchUserAccount', () => {
      it('should fetch user accounts corresponding to the query and should return the right mapped object', async () => {
        const params = {
          filter: { Entity: { Id: { searchIn_az: ['id'] } } },
          top: 999,
        };

        const user = mockCombinedUserAccount();

        wrapper.vm.$storage.userAccount.actions.search = jest.fn(() => ({ ids: [] }));
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [user]);
        const result = await wrapper.vm.searchUserAccount(params);
        expect(wrapper.vm.$storage.userAccount.actions.search).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['id'] } } },
          top: 999,
        });

        expect(result).toEqual([mockCombinedUserAccount()]);
      });
    });

    describe('fetchUsersFilter', () => {
      it('should call searchUserAccount with the right query', async () => {
        wrapper.vm.searchUserAccount = jest.fn();
        await wrapper.vm.fetchUsersFilter('test', ['level3', 'level4'], 10);
        expect(wrapper.vm.searchUserAccount).toHaveBeenCalledWith({
          search: '((/.*test.*/ OR "\\"test\\""))',
          searchFields: 'Metadata/DisplayName',
          filter: "Entity/Roles/any(r: search.in(r/OptionItemId, 'level3,level4'))",
          top: 10,
          orderBy: 'Metadata/DisplayName',
          queryType: 'full',
          searchMode: 'all',
        });
      });
    });

    describe('onLoadUserAccountFilters', () => {
      it('calls getSelectedUsersForFilterKey and should add the result to the right key', async () => {
        wrapper.vm.getSelectedUsersForFilterKey = jest.fn(() => ([{
          text: 'user',
          value: '1',
        }]));
        await wrapper.setData({
          userAccountFilterState: {
            to: {
              users: [{ text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' }],
              filterKey: 'ToFilter',
            },
          },
        });
        const filterFormData = {
          name: 'form',
          values: {
            ToFilter: { operator: '', value: { text: 'user', value: '1' } },
          },
        };
        await wrapper.vm.onLoadUserAccountFilters(filterFormData);

        expect(wrapper.vm.getSelectedUsersForFilterKey).toBeCalledWith('ToFilter', filterFormData);
        expect(wrapper.vm.userAccountFilterState.to.users).toEqual([
          { text: 'user', value: '1' }, { text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' },
        ]);
      });
    });

    describe('getSelectedUsersForFilterKey', () => {
      it('calls fetchUsersByIds with the right payload', () => {
        wrapper.vm.fetchUsersByIds = jest.fn(() => []);
        const filterFormData = {
          name: 'form',
          values: {
            SubmittedTo: { operator: '', value: ['1'] },
          },
        };

        wrapper.vm.getSelectedUsersForFilterKey('SubmittedTo', filterFormData);
        expect(wrapper.vm.fetchUsersByIds).toHaveBeenCalledWith(['1']);
      });
    });

    describe('debounceSearchUsersFilter', () => {
      it('should call fetchUsers', async () => {
        wrapper.vm.fetchUsers = jest.fn();

        wrapper.vm.debounceSearchUsersFilter();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(wrapper.vm.fetchUsers).toHaveBeenCalledTimes(1);
      });
    });

    describe('throttleOnLoadFilter', () => {
      it('should throttle onLoadApprovalFilters', async () => {
        wrapper.vm.onLoadApprovalFilters = jest.fn();

        wrapper.vm.throttleOnLoadFilter();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 300));
        wrapper.vm.throttleOnLoadFilter();

        expect(wrapper.vm.onLoadApprovalFilters).toHaveBeenCalledTimes(1);
      });
    });

    describe('onUserAutoCompleteUpdate', () => {
      it('should set query and users for the right key', async () => {
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [user]);
        await wrapper.setData({
          userAccountFilterState: {
            to: {
              users: [{ text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' }],
              filterKey: 'ToFilter',
            },
          },
        });
        wrapper.vm.onUserAutoCompleteUpdate({
          filterKey: 'ToFilter',
          search: 'search',
          selectedItem: ['id-1'],
        });

        expect(wrapper.vm.userAccountFilterState.to.query).toEqual('search');
        expect(wrapper.vm.$storage.userAccount.getters.getByIds).toHaveBeenCalledWith(['id-1']);
        expect(wrapper.vm.userAccountFilterState.to.selectedUsers).toEqual([{ text: user.metadata.displayName, value: user.entity.id }]);
      });

      it('should call debounceSearchUsersFilter if there is a search term', async () => {
        wrapper.vm.debounceSearchUsersFilter = jest.fn();
        await wrapper.setData({
          userAccountFilterState: {
            to: {
              users: [{ text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' }],
              filterKey: 'ToFilter',
            },
          },
        });
        wrapper.vm.onUserAutoCompleteUpdate({
          filterKey: 'ToFilter',
          search: 'search  ',
          selectedItem: ['id-1'],
        });

        expect(wrapper.vm.debounceSearchUsersFilter).toHaveBeenCalledWith('search', 'to');
      });
    });
  });
});
