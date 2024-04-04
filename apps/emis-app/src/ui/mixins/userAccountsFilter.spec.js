import userAccountsFilter from '@/ui/mixins/userAccountsFilter';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { UserRolesNames } from '@libs/entities-lib/user';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';

const Component = {
  render() {},
  mixins: [userAccountsFilter],
};

const localVue = createLocalVue();
const user = mockCombinedUserAccount();
const { pinia, userAccountStore } = useMockUserAccountStore();
let wrapper;

describe('userAccountsFilter', () => {
  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
      });
    });

    describe('fetchUsers', () => {
      it(' calls the getter rolesByLevels with the right payload', async () => {
        await wrapper.setData({ userAccountFilterState: { to: { levels: [UserRolesNames.level3, UserRolesNames.level4] } } });
        userAccountStore.rolesByLevels = jest.fn(() => []);
        wrapper.vm.fetchUsers('', 'to');
        expect(userAccountStore.rolesByLevels).toHaveBeenCalledWith([UserRolesNames.level3, UserRolesNames.level4]);
      });

      it('calls fetchUsersFilter and stores the response into the right data property', async () => {
        await wrapper.setData({ userAccountFilterState: { to: { levels: [UserRolesNames.level3, UserRolesNames.level4] } } });
        wrapper.vm.fetchUsersFilter = jest.fn(() => [mockCombinedUserAccount({ id: '1', displayName: 'a' })]);
        userAccountStore.rolesByLevels = jest.fn(() => [{ name: 'role1', id: 'id-1' }]);
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
          filter: { Entity: { Id: { in: ['id'] } } },
          top: 999,
        });
      });
    });

    describe('searchUserAccount', () => {
      it('should fetch user accounts corresponding to the query and should return the right mapped object', async () => {
        const params = {
          filter: { Entity: { Id: { in: ['id'] } } },
          top: 999,
        };

        const user = mockCombinedUserAccount();

        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ ids: [] }));
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [user]);
        const result = await wrapper.vm.searchUserAccount(params);
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: { Entity: { Id: { in: ['id'] } } },
          top: 999,
        }, null, false, true);

        expect(result).toEqual([mockCombinedUserAccount()]);
      });
    });

    describe('fetchUsersFilter', () => {
      it('should call combinedUserAccountStore search with the right query when there are no roles passed as argument', async () => {
        wrapper.vm.combinedUserAccountStore.search = jest.fn();
        await wrapper.vm.fetchUsersFilter('test', null, 10);
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: {
            and: [
              { 'metadata/searchableText': { contains: 'test' } },
            ],
          },
          searchFields: 'Metadata/DisplayName',
          top: 10,
          orderBy: 'Metadata/DisplayName',
          queryType: 'full',
          searchMode: 'all',
        }, null, false, true);
      });

      it('should call callSearchInInBatches with the right payload if there are roles passed as argument', async () => {
        sharedHelpers.callSearchInInBatches = jest.fn(() => ({ ids: ['id-1'] }));
        await wrapper.vm.fetchUsersFilter('test', ['level3', 'level4'], 10);
        expect(sharedHelpers.callSearchInInBatches).toHaveBeenCalledWith({
          ids: ['level3', 'level4'],
          searchInFilter: 'Metadata/RoleName/Id in ({ids})',
          otherFilter: 'contains(Metadata/DisplayName, \'test\')',
          otherOptions: {
            top: 10,
            searchFields: 'Metadata/DisplayName',
            orderBy: 'Metadata/DisplayName',
            queryType: 'full',
            searchMode: 'all' },
          service: wrapper.vm.combinedUserAccountStore,
          otherApiParameters: [null, false, true],
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
        wrapper.vm.combinedUserAccountStore.getByIds = jest.fn(() => [user]);
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
        expect(wrapper.vm.combinedUserAccountStore.getByIds).toHaveBeenCalledWith(['id-1']);
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
