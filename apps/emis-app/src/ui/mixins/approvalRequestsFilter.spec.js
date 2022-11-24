import approvalRequestsFilter from '@/ui/mixins/approvalRequestsFilter';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { UserRolesNames } from '@libs/entities-lib/user';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';

const Component = {
  render() {},
  mixins: [approvalRequestsFilter],
};

const localVue = createLocalVue();
const user = mockCombinedUserAccount();
let wrapper;

describe('approvalRequestsFilter', () => {
  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          customColumns() {
            return { event: 'event', submittedTo: 'submittedTo', submittedBy: 'submittedBy' };
          },
        },
      });
    });

    describe('fetchUsers', () => {
      it(' calls the getter rolesByLevels with the right payload', () => {
        wrapper.vm.$storage.userAccount.getters.rolesByLevels = jest.fn(() => []);
        wrapper.vm.fetchUsers('to');
        expect(wrapper.vm.$storage.userAccount.getters.rolesByLevels).toHaveBeenCalledWith([UserRolesNames.level3, UserRolesNames.level4]);
      });

      it('calls fetchUsersFilter and stores the response into the right data property for submittedTo, adding selectedSubmittedToUsers', async () => {
        wrapper.vm.fetchUsersFilter = jest.fn(() => [{ text: 'a', value: '1' }]);
        wrapper.vm.$storage.userAccount.getters.rolesByLevels = jest.fn(() => [{ name: 'role1', id: 'id-1' }]);
        wrapper.setData({ selectedSubmittedToUsers: [{ name: 'b', id: '2' }] });
        await wrapper.vm.fetchUsers('to', 'search', 10);

        expect(wrapper.vm.fetchUsersFilter).toHaveBeenCalledWith('search', ['id-1'], 10);
        expect(wrapper.vm.submittedToUsers).toEqual([{ text: 'a', value: '1' }, { name: 'b', id: '2' }]);
      });

      it('calls fetchUsersFilter and stores the response into the right data property for submittedBy, adding  selectedSubmittedByUsers', async () => {
        wrapper.vm.fetchUsersFilter = jest.fn(() => [{ text: 'a', value: '1' }]);
        wrapper.vm.$storage.userAccount.getters.rolesByLevels = jest.fn(() => []);
        wrapper.setData({ selectedSubmittedByUsers: [{ name: 'b', id: '2' }] });
        await wrapper.vm.fetchUsers('by', 'search', 10);

        expect(wrapper.vm.fetchUsersFilter).toHaveBeenCalledWith('search', [], 10);
        expect(wrapper.vm.submittedByUsers).toEqual([{ text: 'a', value: '1' }, { name: 'b', id: '2' }]);
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

        expect(result).toEqual([{ text: user.metadata.displayName, value: user.entity.id }]);
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

    describe('onLoadApprovalFilters', () => {
      it('should call onLoadFilter ', async () => {
        wrapper.vm.onLoadFilter = jest.fn();
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadApprovalFilters(filterFormData);
        expect(wrapper.vm.onLoadFilter).toHaveBeenCalledWith(filterFormData, 'Metadata/EventId');
      });

      it('calls getSelectedUsersForFilterKey and should add the result to submittedToUsers', async () => {
        wrapper.vm.getSelectedUsersForFilterKey = jest.fn(() => ([{
          text: 'user',
          value: '1',
        }]));

        await wrapper.setData({ submittedToUsers: [{ text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' }] });

        const filterFormData = {
          name: 'form',
          values: {
            SubmittedTo: { operator: '', value: { text: 'name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadApprovalFilters(filterFormData);

        expect(wrapper.vm.getSelectedUsersForFilterKey).toBeCalledWith('Entity/SubmittedTo/UserId', filterFormData);

        expect(wrapper.vm.submittedToUsers).toEqual([
          { text: 'user', value: '1' }, { text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' },
        ]);
      });

      it('calls getSelectedUsersForFilterKey and should add the result to submittedByUsers', async () => {
        wrapper.vm.getSelectedUsersForFilterKey = jest.fn(() => ([{
          text: 'user',
          value: '1',
        }]));
        await wrapper.setData({ submittedByUsers: [{ text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' }] });

        const filterFormData = {
          name: 'form',
          values: {
            SubmittedBy: { operator: '', value: { text: 'name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadApprovalFilters(filterFormData);

        expect(wrapper.vm.getSelectedUsersForFilterKey).toBeCalledWith('Entity/SubmittedBy/UserId', filterFormData);

        expect(wrapper.vm.submittedByUsers).toEqual([
          { text: 'user', value: '1' }, { text: 'user 1', value: '7c076603-580a-4400-bef2-5ddececb0931' },
        ]);
      });
    });

    describe('getSelectedUsersForFilterKey', () => {
      it('calls fetchUsersByIds with the right payload', () => {
        wrapper.vm.fetchUsersByIds = jest.fn();
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

    describe('onAutoCompleteUpdate', () => {
      it('should set eventFilterQuery', () => {
        wrapper.vm.onAutoCompleteUpdate({
          filterKey: 'Metadata/EventId',
          search: 'search',
          selectedItem: { text: '', value: '' },
        });

        expect(wrapper.vm.eventFilterQuery).toEqual('search');
      });

      it('should set submittedByQuery and selectedSubmittedByUsers', () => {
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [user]);
        wrapper.vm.onAutoCompleteUpdate({
          filterKey: 'Entity/SubmittedBy/UserId',
          search: 'search',
          selectedItem: ['id-1'],
        });

        expect(wrapper.vm.submittedByQuery).toEqual('search');
        expect(wrapper.vm.$storage.userAccount.getters.getByIds).toHaveBeenCalledWith(['id-1']);
        expect(wrapper.vm.selectedSubmittedByUsers).toEqual([{ text: user.metadata.displayName, value: user.entity.id }]);
      });

      it('should set submittedToQuery and selectedSubmittedByUsers', () => {
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => [user]);
        wrapper.vm.onAutoCompleteUpdate({
          filterKey: 'Entity/SubmittedTo/UserId',
          search: 'search',
          selectedItem: ['id-1'],
        });

        expect(wrapper.vm.submittedToQuery).toEqual('search');
        expect(wrapper.vm.$storage.userAccount.getters.getByIds).toHaveBeenCalledWith(['id-1']);
        expect(wrapper.vm.selectedSubmittedToUsers).toEqual([{ text: user.metadata.displayName, value: user.entity.id }]);
      });
    });

    describe('onOpenFilters', () => {
      it('calls fetchEventsFilter and fetchUsers', () => {
        wrapper.vm.fetchEventsFilter = jest.fn();
        wrapper.vm.fetchUsers = jest.fn();
        wrapper.vm.onOpenFilters();
        expect(wrapper.vm.fetchEventsFilter).toHaveBeenCalled();
        expect(wrapper.vm.fetchUsers).toHaveBeenCalledWith('to');
        expect(wrapper.vm.fetchUsers).toHaveBeenCalledWith('by');
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('submittedToQuery', () => {
      it('should call debounceSearchUsersFilter with trimmed query', async () => {
        wrapper.vm.debounceSearchUsersFilter = jest.fn();
        await wrapper.setData({
          submittedToQuery: 'query',
        });

        expect(wrapper.vm.debounceSearchUsersFilter).toHaveBeenCalledWith('to', 'query');
      });

      it('should set submittedToUsers to selectedSubmittedToUsers if no value', async () => {
        wrapper.vm.submittedToUsers = jest.fn();
        await wrapper.setData({
          submittedToQuery: '',
          submittedToUsers: ['data'],
          selectedSubmittedToUsers: [{ name: 'b', id: '2' }],
        });

        expect(wrapper.vm.submittedToUsers).toEqual([{ name: 'b', id: '2' }]);
      });
    });

    describe('submittedByQuery', () => {
      it('should call debounceSearchUsersFilter with trimmed query', async () => {
        wrapper.vm.debounceSearchUsersFilter = jest.fn();
        await wrapper.setData({
          submittedByQuery: 'query',
        });

        expect(wrapper.vm.debounceSearchUsersFilter).toHaveBeenCalledWith('by', 'query');
      });

      it('should set submittedByUsers to selectedSubmittedByUsers if no value', async () => {
        wrapper.vm.submittedByUsers = jest.fn();
        await wrapper.setData({
          submittedByQuery: '',
          submittedByUsers: ['data'],
          selectedSubmittedByUsers: [{ name: 'b', id: '2' }],
        });

        expect(wrapper.vm.submittedByUsers).toEqual([{ name: 'b', id: '2' }]);
      });
    });
  });
});
