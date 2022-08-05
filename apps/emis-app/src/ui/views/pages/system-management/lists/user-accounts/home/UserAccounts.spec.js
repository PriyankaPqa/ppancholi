import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData, mockRoles } from '@libs/entities-lib/optionItem';
import { mockUserStateLevel } from '@/test/helpers';

import {
  AccountStatus, mockCombinedUserAccounts, mockCombinedUserAccount, mockUserAccountEntity, mockUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';
import Component from './UserAccounts.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const usersTestData = mockCombinedUserAccounts();
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
  storage.userAccount.actions.fetchRoles = jest.fn(() => mockOptionItemData());
  storage.userAccount.getters.roles = jest.fn(() => mockOptionItemData());
  storage.userAccount.getters.getAll = jest.fn(() => usersTestData);
  storage.userAccount.actions.deactivate = jest.fn(() => usersTestData[0].entity);
  storage.userAccount.actions.assignRole = jest.fn(() => usersTestData[0].entity);
  storage.userAccount.actions.fetchAll = jest.fn(() => usersTestData);
  storage.uiState.getters.getSearchTableState = jest.fn(() => ({ itemsPerPage: 25 }));

  const mountWrapper = async (additionalOverwrites = {}) => {
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
          loading: false,
          allSubRoles: [],
          allActiveSubRoles: [],
          changedAccounts: [],
        };
      },
      mocks: {
        $storage: storage,
      },
      ...additionalOverwrites,
    });
  };

  describe('Created', () => {
    it('loads lookup lists', async () => {
      jest.clearAllMocks();
      mountWrapper();

      jest.spyOn(wrapper.vm, 'fetchAllEmisUsers').mockImplementation(() => usersTestData);
      jest.spyOn(wrapper.vm, 'setRoles').mockImplementation(() => mockOptionItemData());

      for (let i = 0; i < wrapper.vm.$options.created.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await wrapper.vm.$options.created[i].call(wrapper.vm);
      }

      expect(storage.userAccount.actions.fetchRoles).toHaveBeenCalled();
      expect(wrapper.vm.fetchAllEmisUsers).toHaveBeenCalled();
      expect(wrapper.vm.setRoles).toHaveBeenCalled();
    });

    it('sets the items per page from the store', () => {
      jest.clearAllMocks();
      mountWrapper();
      for (let i = 0; i < wrapper.vm.$options.created.length; i += 1) {
        wrapper.vm.$options.created[i].call(wrapper.vm);
      }

      expect(wrapper.vm.options.itemsPerPage).toEqual(25);
    });
  });

  describe('Computed', () => {
    describe('roles', () => {
      it('returns theroles from the store ', async () => {
        mountWrapper();
        expect(wrapper.vm.roles).toEqual(mockOptionItemData());
      });
    });
    describe('headers', () => {
      it('is correctly defined', async () => {
        mountWrapper();
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'system_management.userAccounts.name_header',
            class: 'emis_member_header',
            filterable: true,
            sortable: true,
            align: 'start',
            value: 'metadata.displayName',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.emailUsername_header',
            class: 'emis_member_header',
            filterable: true,
            sortable: true,
            value: 'metadata.emailAddress',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.role_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: 'metadata.roleId',
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.status_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: 'entity.accountStatus',
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
        mountWrapper();
        expect(wrapper.vm.customColumns).toEqual(
          {
            displayName: 'metadata.displayName',
            email: 'metadata.emailAddress',
            roleId: 'metadata.roleId',
            accountStatus: 'entity.accountStatus',
            edit: 'edit',
            delete: 'delete',
          },
        );
      });
    });

    describe('loadingText', () => {
      it('is correctly defined', async () => {
        mountWrapper();
        expect(wrapper.vm.loadingText).toEqual('system_management.userAccounts.loading_users');
      });
    });

    describe('tableProps', () => {
      it('is correctly defined', async () => {
        mountWrapper();
        expect(wrapper.vm.tableProps).toEqual({
          loading: wrapper.vm.loading,
        });
      });
    });

    describe('itemsPerPage', () => {
      it('returns correct count for populated array', async () => {
        mountWrapper({
          computed: {
            users() {
              return usersTestData;
            },
          },
        });
        expect(wrapper.vm.itemsPerPage).toEqual(usersTestData.length);
      });
    });

    describe('labels', () => {
      it('is correctly defined', async () => {
        mountWrapper();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'system_management.leftMenu.user_accounts_title',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('filteredUserAccounts', () => {
      it('returns correct count for populated array', async () => {
        mountWrapper({
          computed: {
            users() {
              return usersTestData;
            },
          },
        });
        await wrapper.setData({ search: usersTestData[0].metadata.displayName.substring(3) });
        expect(wrapper.vm.filteredUserAccounts[0]).toEqual(usersTestData[0]);
      });

      it('returns empty array if nothing matches', async () => {
        mountWrapper({
          computed: {
            users() {
              return usersTestData;
            },
          },
        });
        wrapper.vm.search = 'this string will match nothing';
        wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUserAccounts.length).toEqual(0);
      });
      it('returns all users if no search filter exists', async () => {
        mountWrapper({
          computed: {
            users() {
              return usersTestData;
            },
          },
        });
        wrapper.vm.search = '';
        wrapper.vm.$nextTick();
        expect(wrapper.vm.filteredUserAccounts).toEqual(usersTestData);
      });
    });

    describe('users', () => {
      it('returns the filtered users from the store filtered ', async () => {
        storage.userAccount.getters.getAll = jest.fn(() => [...usersTestData,
          mockCombinedUserAccount({ id: 3, status: Status.Inactive }), mockCombinedUserAccount({ id: 4, status: Status.Active })]);
        mountWrapper();
        expect(wrapper.vm.users).toEqual([...usersTestData, mockCombinedUserAccount({ id: 4, status: Status.Active })]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      mountWrapper();
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

    describe('modifiedUser', () => {
      it('returns the user if it is in modifiedUsers list', async () => {
        const user = mockCombinedUserAccount({ id: '1234' });
        wrapper.vm.modifiedUsers = [...usersTestData, user];
        expect(wrapper.vm.modifiedUser(user)).toEqual(user);
      });

      it('does not return a user if it is not in modifiedUsers list', async () => {
        const user = mockCombinedUserAccount({ id: '1234' });
        wrapper.vm.modifiedUsers = usersTestData;
        expect(wrapper.vm.modifiedUser(user)).toBeFalsy();
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
        expect(wrapper.vm.getRoleListItem('mock-id')).toEqual({ text: 'mock-name', value: 'mock-id', isInactive: false });
      });
    });

    describe('getRolesForUser', () => {
      it("includes current user's inactive role", async () => {
        wrapper.vm.allSubRoles = [{ id: -999, name: 'outdated', status: 2 }];
        await wrapper.vm.setAllAccessLevelRoles(mockOptionItemData());
        const user = usersTestData[0];
        user.entity.roles[0] = { optionItemId: -999 };
        const rolesReturned = wrapper.vm.getRolesForUser(user);
        expect(rolesReturned).toContainEqual({ text: 'outdated', value: -999, isInactive: true });
        expect(rolesReturned.length).toEqual(wrapper.vm.allAccessLevelRoles.length + 1);
      });

      it('returns only one item if user role cannot be managed', async () => {
        const user = usersTestData[0];

        wrapper.vm.canNotManageRoleForUser = jest.fn(() => true);

        const rolesReturned = wrapper.vm.getRolesForUser(user);

        expect(rolesReturned.length).toBe(1);
        expect(rolesReturned[0].text).toEqual(user.metadata.roleName);
        expect(rolesReturned[0].value).toEqual(user.metadata.roleId);
      });
    });

    describe('updateUserRole', () => {
      it('adds the modified user to the list modifiedUsers', () => {
        const user = mockCombinedUserAccount({ id: '1234', roles: [{ optionItemId: '123' }] });
        wrapper.vm.allSubRoles = mockOptionItemData()[0].subitems;
        const roleData = { value: wrapper.vm.allSubRoles[0].id };

        wrapper.vm.updateUserRole(roleData, user);

        const expected = _cloneDeep(user);
        expected.entity.roles[0].optionItemId = wrapper.vm.allSubRoles[0].id;
        expected.metadata.roleId = wrapper.vm.allSubRoles[0].id;
        expected.metadata.roleName = wrapper.vm.allSubRoles[0].name;

        expect(wrapper.vm.modifiedUsers).toEqual([expected]);
      });

      it('removes the modified user from the user of modified users, if the new role is the same as the original', async () => {
        wrapper.vm.allSubRoles = mockOptionItemData()[0].subitems;
        const user = ({
          entity: mockUserAccountEntity({ id: '1234', roles: [{ optionItemId: wrapper.vm.allSubRoles[0].id }] }),
          metadata: mockUserAccountMetadata(),
        });
        const modifiedUser = { entity: { ...user.entity, roles: [{ optionItemId: '123' }] }, metadata: user.metadata };
        jest.spyOn(wrapper.vm, 'modifiedUser').mockImplementation(() => modifiedUser);
        wrapper.vm.modifiedUsers = [modifiedUser];
        const roleData = { value: wrapper.vm.allSubRoles[0].id };

        await wrapper.vm.updateUserRole(roleData, user);

        expect(wrapper.vm.modifiedUsers).toEqual([]);
      });
    });

    describe('applyRoleChange', () => {
      it('applies a pending role change and triggers a success toast and a reload of data and removes the user from modifiedUsers', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();

        const user = {
          entity: {
            id: '12345',
            status: 1,
            accountStatus: AccountStatus.Active,
          },
          metadata: {
            id: '12345',
            roleId: '123',
            roleName: 'ROLE',
          },
        };
        const changedUser = {
          entity: {
            id: '12345',
            status: Status.Active,
            accountStatus: AccountStatus.Active,
            roles: [{ optionItemId: fakeSubRole.id }],
          },
          metadata: {
            id: '12345',
            status: Status.Active,
            roleId: fakeSubRole.id,
            roleName: fakeSubRole.name,
          },
        };

        wrapper.vm.modifiedUser = jest.fn(() => changedUser);
        wrapper.vm.fetchAllEmisUsers = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn(() => changedUser.entity);
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        await wrapper.vm.applyRoleChange(user);

        expect(wrapper.vm.$storage.userAccount.actions.assignRole).toHaveBeenCalledWith({ subRole: fakeSubRole, userId: user.entity.id });
        expect(wrapper.vm.fetchAllEmisUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.modifiedUsers.indexOf(changedUser)).not.toBeGreaterThanOrEqual(0); // Not found
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelRoleChange', () => {
      it('cancels a pending role change', () => {
        const changedUser = {
          entity: {
            id: '12345',
            status: 1,
            roles: [{
              optionItemId: '456',
            }],
          },
          metadata: {
            id: '12345',
            roleId: '456',
            roleName: 'NEW ROLE',
          },
        };

        wrapper.vm.modifiedUsers.push(changedUser);
        expect(wrapper.vm.modifiedUsers.indexOf(changedUser)).toBeGreaterThanOrEqual(0); // Found

        wrapper.vm.cancelRoleChange(changedUser);
        expect(wrapper.vm.modifiedUsers.indexOf(changedUser)).not.toBeGreaterThanOrEqual(0); // Not found
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
      it('deletes the user and reloads the data', async () => {
        storage.userAccount.actions.deactivate = jest.fn(() => {});
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.clearDeletionStatus = jest.fn();
        wrapper.vm.fetchAllEmisUsers = jest.fn();

        const user = { entity: { id: '12345', accountStatus: AccountStatus.Active, status: Status.Active } };
        wrapper.vm.userToDelete = user;
        wrapper.vm.$storage.userAccount.actions.deactivate = jest.fn(() => user.entity);

        await wrapper.vm.applyDeleteUserAccount();

        expect(wrapper.vm.$storage.userAccount.actions.deactivate).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchAllEmisUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.clearDeletionStatus).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
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
        jest.clearAllMocks();
        await wrapper.vm.fetchAllEmisUsers();
        expect(wrapper.vm.$storage.userAccount.actions.fetchAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('setRoles', () => {
      it('calls setAllActiveSubRoles and setAllAccessLevelRoles with the result of the storage call', async () => {
        mountWrapper({
          computed: {
            roles() {
              return mockOptionItemData();
            },
          },
        });
        jest.spyOn(wrapper.vm, 'setAllActiveSubRoles').mockImplementation(() => {});
        jest.spyOn(wrapper.vm, 'setAllAccessLevelRoles').mockImplementation(() => {});

        await wrapper.vm.setRoles();

        expect(wrapper.vm.setAllActiveSubRoles).toHaveBeenCalledWith(mockOptionItemData());
        expect(wrapper.vm.setAllAccessLevelRoles).toHaveBeenCalledWith(mockOptionItemData());
      });

      it('sets disallowedRoles', async () => {
        mountWrapper({
          computed: {
            roles() {
              return mockRoles();
            },
          },
        });

        await wrapper.vm.setRoles();

        expect(wrapper.vm.disallowedRoles).toEqual(
          mockRoles()
            .filter((r) => wrapper.vm.disallowedLevels.some((level) => level === r.name.translation.en))
            .reduce((acc, val) => acc.concat(val.subitems), []),
        );
      });
    });

    describe('setAllActiveSubRoles', () => {
      it('sets the right data into allActiveSubRoles', async () => {
        await wrapper.vm.setAllActiveSubRoles(mockOptionItemData());
        const expected = mockOptionItemData()
          .reduce((acc, curr) => {
            acc.push(...curr.subitems);
            return acc;
          }, [])
          .filter((role) => role.status === Status.Active) || [];

        expect(wrapper.vm.allActiveSubRoles).toEqual(expected);
      });
    });

    describe('getUserAccountDetailsRoute', () => {
      it('returns route to detailed account settings', async () => {
        const res = wrapper.vm.getUserAccountDetailsRoute('myid');
        expect(res).toEqual({
          name: routes.systemManagement.userAccounts.details.name,
          params: {
            id: 'myid',
          },
        });
      });
    });

    describe('canNotManageRoleForUser', () => {
      beforeEach(async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              disallowedRoles: [
                {
                  name: {
                    translation: {
                      en: 'System Admin',
                    },
                  },
                },
                {
                  name: {
                    translation: {
                      en: 'Information Management Team Member',
                    },
                  },
                },
              ],
            };
          },
          store: {
            ...mockUserStateLevel(6),
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  fetchRoles: jest.fn(() => mockOptionItemData()),
                  deactivate: jest.fn(() => usersTestData[0].entity),
                  assignRole: jest.fn(() => usersTestData[0].entity),
                  fetchAll: jest.fn(() => usersTestData),
                },
                getters: {
                  roles: jest.fn(() => mockOptionItemData()),
                  getAll: jest.fn(() => usersTestData),
                },
              },
            },
          },
        });
      });

      it('return false is current user is level 6', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              disallowedRoles: [
                {
                  name: {
                    translation: {
                      en: 'System Admin',
                    },
                  },
                },
                {
                  name: {
                    translation: {
                      en: 'Information Management Team Member',
                    },
                  },
                },
              ],
            };
          },
          store: {
            ...mockUserStateLevel(6),
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  fetchRoles: jest.fn(() => mockOptionItemData()),
                  deactivate: jest.fn(() => usersTestData[0].entity),
                  assignRole: jest.fn(() => usersTestData[0].entity),
                  fetchAll: jest.fn(() => usersTestData),
                },
                getters: {
                  roles: jest.fn(() => mockOptionItemData()),
                  getAll: jest.fn(() => usersTestData),
                },
              },
            },
          },
        });

        const result = await wrapper.vm.canNotManageRoleForUser();

        expect(result).toBeFalsy();
      });

      it('return false is current user is level 5 and the user in param is allowed', async () => {
        const testUser = {
          metadata: {
            roleName: {
              translation: {
                en: 'some role',
              },
            },
          },
        };

        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              disallowedRoles: [
                {
                  name: {
                    translation: {
                      en: 'System Admin',
                    },
                  },
                },
                {
                  name: {
                    translation: {
                      en: 'Information Management Team Member',
                    },
                  },
                },
              ],
            };
          },
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  fetchRoles: jest.fn(() => mockOptionItemData()),
                  deactivate: jest.fn(() => usersTestData[0].entity),
                  assignRole: jest.fn(() => usersTestData[0].entity),
                  fetchAll: jest.fn(() => usersTestData),
                },
                getters: {
                  roles: jest.fn(() => mockOptionItemData()),
                  getAll: jest.fn(() => usersTestData),
                },
              },
            },
          },
        });

        const result = await wrapper.vm.canNotManageRoleForUser(testUser);

        expect(result).toBeFalsy();
      });

      it('return true is current user is level 5 and the user in param is not allowed', async () => {
        const testUser = {
          metadata: {
            roleName: {
              translation: {
                en: 'Information Management Team Member',
              },
            },
          },
        };

        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              disallowedRoles: [
                {
                  name: {
                    translation: {
                      en: 'System Admin',
                    },
                  },
                },
                {
                  name: {
                    translation: {
                      en: 'Information Management Team Member',
                    },
                  },
                },
              ],
            };
          },
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $storage: {
              userAccount: {
                actions: {
                  fetchRoles: jest.fn(() => mockOptionItemData()),
                  deactivate: jest.fn(() => usersTestData[0].entity),
                  assignRole: jest.fn(() => usersTestData[0].entity),
                  fetchAll: jest.fn(() => usersTestData),
                },
                getters: {
                  roles: jest.fn(() => mockOptionItemData()),
                  getAll: jest.fn(() => usersTestData),
                },
              },
            },
          },
        });

        const result = await wrapper.vm.canNotManageRoleForUser(testUser);

        expect(result).toBeTruthy();
      });
    });

    describe('getRoleValue', () => {
      it('calls getRoleListItem with the role id of the modified user, if the user is in the modifiedUSers list', () => {
        const user = ({
          entity: mockUserAccountEntity({ id: '1234', roles: [{ optionItemId: '1' }] }),
          metadata: mockUserAccountMetadata(),
        });
        const modifiedUser = { entity: { ...user.entity, roles: [{ optionItemId: '123' }] }, metadata: user.metadata };
        wrapper.vm.modifiedUsers = [modifiedUser];
        wrapper.vm.modifiedUser = jest.fn(() => modifiedUser);
        wrapper.vm.getRoleListItem = jest.fn();

        wrapper.vm.getRoleValue(user);

        expect(wrapper.vm.getRoleListItem).toHaveBeenCalledWith('123');
      });

      it('calls getRoleListItem with the role id of the  user, if the user is not in the modifiedUSers list', () => {
        const user = ({
          entity: mockUserAccountEntity({ id: '1234', roles: [{ optionItemId: '1' }] }),
          metadata: mockUserAccountMetadata(),
        });
        wrapper.vm.modifiedUser = jest.fn(() => null);
        wrapper.vm.getRoleListItem = jest.fn();

        wrapper.vm.getRoleValue(user);

        expect(wrapper.vm.getRoleListItem).toHaveBeenCalledWith('1');
      });
    });
  });
});
