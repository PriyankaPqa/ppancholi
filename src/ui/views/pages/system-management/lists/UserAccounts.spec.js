import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockUserAccountSearchData, EAccountStatus, EUserAccountStatus } from '@/entities/user-account';
import _cloneDeep from 'lodash/cloneDeep';
import Component from './UserAccounts.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const usersTestData = mockUserAccountSearchData();
const fakeSubRole = {
  id: '123',
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
};

describe('UserAccounts.vue', () => {
  let wrapper;

  beforeEach(() => {
    storage.optionList.mutations.setList = jest.fn();
    storage.optionList.actions.fetchItems = jest.fn(() => mockOptionItemData());
    wrapper = shallowMount(Component, {
      localVue,
      data() {
        return {
          routes,
          options: {
            page: 1,
            sortBy: ['displayName'],
            sortDesc: [false],
          },
          search: '',
          showAddEmisUserDialog: false,
          showDeleteUserAccountDialog: false,
          userToDelete: null,
          loading: true,
          allUsers: [],
          allSubRoles: [],
          changedAccounts: [],
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Mounted', () => {
    it('loads lookup lists', async () => {
      jest.spyOn(wrapper.vm, 'fetchAllEmisUsers').mockImplementation(() => true);
      jest.spyOn(wrapper.vm, 'setRoles').mockImplementation(() => mockOptionItemData());

      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchAllEmisUsers).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.setRoles).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        data() {
          return {
            routes,
            options: {
              page: 1,
              sortBy: ['displayName'],
              sortDesc: [false],
            },
            search: '',
            showAddEmisUserDialog: false,
            showDeleteUserAccountDialog: false,
            userToDelete: null,
            loading: true,
            allUsers: [],
            allSubRoles: [],
            changedAccounts: [],
          };
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('headers', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'system_management.userAccounts.name_header',
            class: 'emis_member_header',
            filterable: true,
            sortable: true,
            align: 'start',
            value: 'displayName',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.emailUsername_header',
            class: 'emis_member_header',
            filterable: true,
            sortable: true,
            value: 'email',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.role_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: 'roleId',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.status_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: 'accountStatus',
          },
          {
            text: '',
            class: 'emis_member_header',
            filterable: false,
            sortable: false,
            value: 'edit',
          },
          {
            text: '',
            class: 'emis_member_header',
            filterable: false,
            sortable: false,
            align: 'end',
            value: 'delete',
          },
        ]);
      });
    });

    describe('customColumns', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.customColumns).toEqual(
          {
            displayName: 'displayName',
            email: 'email',
            roleId: 'roleId',
            accountStatus: 'accountStatus',
            edit: 'edit',
            delete: 'delete',
          },
        );
      });
    });

    describe('loadingText', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.loadingText).toEqual('system_management.userAccounts.loading_users');
      });
    });

    describe('tableProps', () => {
      it('is correctly defined', async () => {
        wrapper.vm.$store.state.event.searchLoading = jest.fn();
        expect(wrapper.vm.tableProps).toEqual(
          {
            loading: wrapper.vm.$store.state.event.searchLoading,
          },
        );
      });
    });

    describe('itemsPerPage', () => {
      it('returns correct count for populated array', async () => {
        wrapper.vm.allUsers = usersTestData;
        expect(wrapper.vm.itemsPerPage).toEqual(usersTestData.length);
      });
      it('returns correct count of zero for null array', async () => {
        wrapper.vm.allUers = null;
        expect(wrapper.vm.itemsPerPage).toEqual(0);
      });
    });

    describe('labels', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.labels).toEqual(
          {
            header: {
              title: 'system_management.leftMenu.user_accounts_title',
              searchPlaceholder: 'common.inputs.quick_search',
            },
          },
        );
      });
    });

    describe('filteredUserAccounts', () => {
      it('returns correct count for populated array', async () => {
        wrapper.vm.allUsers = usersTestData;
        wrapper.vm.search = usersTestData[0].displayName.substring(3);
        wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUserAccounts[0]).toEqual(usersTestData[0]);
      });
      it('returns empty array if nothing matches', async () => {
        wrapper.vm.allUsers = usersTestData;
        wrapper.vm.search = 'this string will match nothing';
        wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUserAccounts.length).toEqual(0);
      });
      it('returns all users if no search filter exists', async () => {
        wrapper.vm.allUsers = usersTestData;
        wrapper.vm.search = '';
        wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUserAccounts).toEqual(usersTestData);
      });
    });

    describe('originalUsers', () => {
      it('is correctly defined', async () => {
        wrapper.vm.$storage.userAccount.getters.userAccounts = jest.fn(() => usersTestData);
        expect(wrapper.vm.originalUsers).toEqual(usersTestData);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        data() {
          return {
            routes,
            options: {
              page: 1,
              sortBy: ['displayName'],
              sortDesc: [false],
            },
            search: '',
            showAddEmisUserDialog: false,
            showDeleteUserAccountDialog: false,
            userToDelete: null,
            loading: true,
            allUsers: [],
            allSubRoles: [],
            changedAccounts: [],
          };
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('clearSearch', () => {
      it('clears search string', () => {
        wrapper.vm.search = 'test string';
        wrapper.vm.clearSearch();
        expect(wrapper.vm.search).toEqual('');
      });
    });

    describe('addUser', () => {
      it('toggles visibility of Add EMIS USer dialog', () => {
        wrapper.vm.showAddEmisUserDialog = false;
        wrapper.vm.addUser();
        wrapper.vm.$nextTick();
        expect(wrapper.vm.showAddEmisUserDialog).toEqual(true);
      });
    });

    describe('itemIsChanged', () => {
      it('recognizes a user with a pending role change', async () => {
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        wrapper.vm.changedAccounts = [...usersTestData, user];
        expect(wrapper.vm.itemIsChanged(user)).toBeTruthy();
      });

      it('does not recognize a user without a pending role change', async () => {
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        wrapper.vm.changedAccounts = usersTestData;
        expect(wrapper.vm.itemIsChanged(user)).toBeFalsy();
      });
    });

    describe('getSubRoleById', () => {
      it('retrieves the correct sub-role from a user', async () => {
        wrapper.vm.allSubRoles = mockOptionItemData();
        const user = usersTestData[0];
        user.roleId = wrapper.vm.allSubRoles[0].id;
        expect(wrapper.vm.getSubRoleById(user.roleId)).toEqual(wrapper.vm.allSubRoles[0]);
      });
    });

    describe('getRoleListItem', () => {
      it('returns the right value', () => {
        jest.spyOn(wrapper.vm, 'getSubRoleById').mockImplementation(() => ({ name: 'mock-name', id: 'mock-id' }));
        expect(wrapper.vm.getRoleListItem('mock-id')).toEqual({ text: 'mock-name', value: 'mock-id' });
      });
    });

    describe('assignRoleToUser', () => {
      it('assigns the correct sub-role to a user', async () => {
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        wrapper.vm.allSubRoles = mockOptionItemData()[0].subitems;
        const roleData = { value: wrapper.vm.allSubRoles[0].id };

        wrapper.vm.assignRoleToUser(roleData, user);

        expect(user.roleId).toEqual(wrapper.vm.allSubRoles[0].id);
        expect(user.roleName).toEqual(wrapper.vm.allSubRoles[0].name);
        expect(wrapper.vm.changedAccounts.indexOf(user)).toBeGreaterThanOrEqual(0);
      });
    });

    describe('applyRoleChange', () => {
      it('does nothing if no change in role', async () => {
        wrapper.vm.itemIsChanged = jest.fn(() => false);
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn();
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        wrapper.vm.applyRoleChange(user);
        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).not.toHaveBeenCalled();
      });

      it('applies a pending role change and triggers a success toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        const changedUser = {
          id: '12345',
          roleId: fakeSubRole.id,
          roleName: fakeSubRole.name,
          accountStatus: EAccountStatus.Active,
          status: EUserAccountStatus.Active,
        };
        wrapper.vm.itemIsChanged = jest.fn(() => true);
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn(() => changedUser);
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        await wrapper.vm.applyRoleChange(user);
        wrapper.vm.$nextTick();

        expect(user.roleName).toEqual(fakeSubRole.name);
        expect(user.roleId).toEqual(fakeSubRole.id);
        expect(user.accountStatus).toEqual(changedUser.accountStatus);
        expect(user.status).toEqual(changedUser.status);
        expect(wrapper.vm.loading).toBeFalsy();

        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelRoleChange', () => {
      it('cancels a pending role change', () => {
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        const changedUser = {
          id: '12345',
          roleId: '456',
          roleName: 'NEW ROLE',
        };
        const origUsers = _cloneDeep(usersTestData);
        origUsers.push(user);
        wrapper.vm.$storage.userAccount.getters.userAccounts = jest.fn(() => origUsers);
        wrapper.vm.changedAccounts.push(changedUser);
        expect(wrapper.vm.changedAccounts.indexOf(changedUser)).toBeGreaterThanOrEqual(0); // Found
        wrapper.vm.cancelRoleChange(changedUser);
        expect(wrapper.vm.changedAccounts.indexOf(changedUser)).not.toBeGreaterThanOrEqual(0); // Not found
        expect(changedUser.roleId).toEqual(user.roleId);
        expect(changedUser.roleName).toEqual(user.roleName);
      });
    });

    describe('revertToOriginalRole', () => {
      it('restores the user\'s original role', () => {
        const user = {
          id: '12345',
          roleId: '123',
          roleName: 'ROLE',
        };
        const changedUser = {
          id: '12345',
          roleId: '456',
          roleName: 'NEW ROLE',
        };
        const origUsers = _cloneDeep(usersTestData);
        origUsers.push(user);
        wrapper.vm.$storage.userAccount.getters.userAccounts = jest.fn(() => origUsers);
        wrapper.vm.revertToOriginalRole(changedUser);
        expect(changedUser.roleId).toEqual(user.roleId);
        expect(changedUser.roleName).toEqual(user.roleName);
      });
    });

    describe('deleteUserAccount', () => {
      it('sets the correct variables for deletion', async () => {
        const user = { id: '12345' };
        wrapper.vm.deleteUserAccount(user);
        expect(wrapper.vm.userToDelete).toEqual(user);
        expect(wrapper.vm.showDeleteUserAccountDialog).toEqual(true);
      });
    });

    describe('applyDeleteUserAccount', () => {
      it('deletes the user and clears out the account deletion variables', async () => {
        wrapper.vm.$storage.userAccount.actions.deleteUserAccount = jest.fn();
        wrapper.vm.clearDeletionStatus = jest.fn();
        wrapper.vm.removeUserAccountById = jest.fn();
        const user = { id: '12345', accountStatus: EAccountStatus.Active, status: EUserAccountStatus.Active };
        wrapper.vm.userToDelete = user;
        wrapper.vm.showDeleteUserAccountDialog = true;
        await wrapper.vm.applyDeleteUserAccount();
        wrapper.vm.$nextTick();
        expect(wrapper.vm.$storage.userAccount.actions.deleteUserAccount).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.removeUserAccountById).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.clearDeletionStatus).toHaveBeenCalledTimes(1);
      });
    });

    describe('clearDeletionStatus', () => {
      it('clears out the account deletion variables', async () => {
        wrapper.vm.userToDelete = { id: '12345' };
        wrapper.vm.showDeleteUserAccountDialog = true;
        wrapper.vm.clearDeletionStatus();
        expect(wrapper.vm.userToDelete).toEqual(null);
        expect(wrapper.vm.showDeleteUserAccountDialog).toEqual(false);
      });
    });

    describe('fetchAllEmisUsers', () => {
      it('invokes the correct storage function', async () => {
        wrapper.vm.$storage.userAccount.getters.userAccounts = jest.fn(() => usersTestData);
        wrapper.vm.$storage.userAccount.actions.fetchAllUserAccounts = jest.fn(() => usersTestData);
        await wrapper.vm.fetchAllEmisUsers();
        expect(wrapper.vm.allUsers).toEqual(usersTestData);
        expect(wrapper.vm.filteredUserAccounts).toEqual(usersTestData);
      });
    });

    describe('setRoles', () => {
      it('invokes the correct storage function', async () => {
        jest.clearAllMocks();
        await wrapper.vm.setRoles();
        expect(storage.optionList.mutations.setList).toBeCalledWith(6); // EOptionLists.Roles
        expect(storage.optionList.actions.fetchItems).toBeCalledTimes(1);
      });

      it('calls setAllActiveSubRoles and setAllAccessLevelRoles with the result of the storage call', async () => {
        jest.spyOn(wrapper.vm, 'setAllActiveSubRoles').mockImplementation(() => {});
        jest.spyOn(wrapper.vm, 'setAllAccessLevelRoles').mockImplementation(() => {});

        await wrapper.vm.setRoles();

        expect(wrapper.vm.setAllActiveSubRoles).toHaveBeenCalledWith(mockOptionItemData());
        expect(wrapper.vm.setAllAccessLevelRoles).toHaveBeenCalledWith(mockOptionItemData());
      });
    });

    describe('setAllActiveSubRoles', () => {
      it('sets the right data into allSubRoles', async () => {
        await wrapper.vm.setAllActiveSubRoles(mockOptionItemData());
        expect(wrapper.vm.allSubRoles).toEqual([mockOptionItemData()[0].subitems[1]]);
      });
    });

    describe('setAllAccessLevelRoles', () => {
      it('sets the right data into allAccessLevelRoles', async () => {
        wrapper.vm.allAccessLevelRoles = [];
        await wrapper.vm.setAllAccessLevelRoles(mockOptionItemData());
        expect(wrapper.vm.allAccessLevelRoles).toEqual([
          { header: mockOptionItemData()[0].name.translation.en },
          { text: mockOptionItemData()[0].subitems[1].name, value: mockOptionItemData()[0].subitems[1].id },
          { header: mockOptionItemData()[1].name.translation.en },
          { header: mockOptionItemData()[2].name.translation.en },
        ]);
      });
    });

    describe('excludeDeletedUsers', () => {
      it('returns an empty array if a null user array is passed', async () => {
        expect(wrapper.vm.excludeDeletedUsers(null)).toEqual([]);
      });

      it('removes deleted accounts', async () => {
        const users = mockUserAccountSearchData();
        expect(wrapper.vm.excludeDeletedUsers(users)).toEqual(users);
        users[0].status = EAccountStatus.Disabled;
        expect(wrapper.vm.excludeDeletedUsers(users)).toEqual(users.splice(-1, 1));
      });
    });

    describe('handleUserAdded', () => {
      it('runs the correct functions', () => {
        wrapper.vm.replaceOrAddToAllUsersById = jest.fn();
        wrapper.vm.handleUsersAdded();
        expect(wrapper.vm.replaceOrAddToAllUsersById).toHaveBeenCalledTimes(1);
      });
    });

    describe('replaceOrAddToAllUsersById', () => {
      it('finds a user by id', () => {
        wrapper.vm.allUsers = [
          { id: '123' },
          { id: '345' },
          { id: '678' },
        ];
        const arrayToRemoveOrReplace = [
          { id: '123', displayName: 'some name' },
          { id: '999' },
        ];
        wrapper.vm.replaceOrAddToAllUsersById(arrayToRemoveOrReplace);
        expect(wrapper.vm.allUsers.find((u) => u.id === arrayToRemoveOrReplace[0].id).displayName).toEqual(arrayToRemoveOrReplace[0].displayName);
        expect(wrapper.vm.allUsers[3]).toEqual(arrayToRemoveOrReplace[1]);
      });
    });

    describe('findUserAccountById', () => {
      it('finds a user by id', () => {
        const array = [{ id: '123' }, { id: '345' }, { id: '678' }];
        expect(wrapper.vm.findUserAccountById(array, array[1].id)).toEqual(array[1]);
      });
    });

    describe('removeUserAccountById', () => {
      it('removes account by id', async () => {
        const users = _cloneDeep(mockUserAccountSearchData());
        const removedUser = users[0];
        wrapper.vm.removeUserAccountById(users, mockUserAccountSearchData()[0].id);
        expect(users).not.toContain(removedUser);
      });

      it('does not change array if no match found', async () => {
        const users = _cloneDeep(mockUserAccountSearchData());
        wrapper.vm.removeUserAccountById(users, { id: '1234567' });
        expect(users).toEqual(users);
      });
    });
  });
});
