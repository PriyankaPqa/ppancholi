import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockOptionItemData, mockRoles } from '@libs/entities-lib/optionItem';
import { UserRoles } from '@libs/entities-lib/user';

import {
  AccountStatus, mockCombinedUserAccounts, mockCombinedUserAccount, mockUserAccountEntity, mockUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';
import { useMockUiStateStore } from '@/pinia/ui-state/uiState.mock';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';

import Component from './UserAccounts.vue';

const localVue = createLocalVue();

const usersTestData = mockCombinedUserAccounts();
const { pinia, uiStateStore } = useMockUiStateStore();
const { userAccountStore } = useMockUserAccountStore(pinia);

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
  userAccountStore.fetchRoles = jest.fn(() => mockOptionItemData());
  userAccountStore.getRoles = jest.fn(() => mockOptionItemData());
  userAccountStore.deactivate = jest.fn(() => usersTestData[0].entity);
  userAccountStore.assignRole = jest.fn(() => usersTestData[0].entity);
  uiStateStore.getSearchTableState = jest.fn(() => ({ itemsPerPage: 25 }));

  const mountWrapper = async (additionalOverwrites = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      data() {
        return {
          routes,
          options: {
            page: 1,
            sortBy: ['Metadata/DisplayName'],
            sortDesc: [false],
          },
          showAddEmisUserDialog: false,
          showDeleteUserAccountDialog: false,
          userToDelete: null,
          loading: false,
          allSubRoles: [],
          allActiveSubRoles: [],
          changedAccounts: [],
        };
      },
      ...additionalOverwrites,
    });
  };

  describe('Created', () => {
    it('loads lookup lists', async () => {
      jest.clearAllMocks();
      mountWrapper();
      jest.spyOn(wrapper.vm, 'setRoles').mockImplementation(() => mockOptionItemData());

      for (let i = 0; i < wrapper.vm.$options.created.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await wrapper.vm.$options.created[i].call(wrapper.vm);
      }

      expect(userAccountStore.fetchRoles).toHaveBeenCalled();
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
    describe('tableData', () => {
      it('should return result of getByIds', () => {
        mountWrapper();
        expect(wrapper.vm.tableData).toEqual(usersTestData);
      });
    });

    describe('roles', () => {
      it('returns theroles from the store ', async () => {
        mountWrapper();
        expect(wrapper.vm.roles).toEqual(mockOptionItemData());
      });
    });

    describe('menuItems', () => {
      it('should return proper menuItems', async () => {
        mountWrapper();
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'system_management.userAccounts.add_new_user',
          value: 'standard',
          icon: 'mdi-account',
          dataTest: 'add-standard-user-link',
        }, {
          text: 'system_management.userAccounts.add_new_ad_user',
          value: 'activeDirectory',
          icon: 'mdi-account-outline',
          dataTest: 'add-activeDirectory-user-link',
        }]);
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
            value: wrapper.vm.customColumns.displayName,
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.emailUsername_header',
            class: 'emis_member_header',
            filterable: true,
            sortable: true,
            value: wrapper.vm.customColumns.email,
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.role_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: wrapper.vm.customColumns.role,
            width: '25%',
          },
          {
            text: 'system_management.userAccounts.status_header',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: wrapper.vm.customColumns.accountStatus,
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
            displayName: 'Metadata/DisplayName',
            email: 'Metadata/EmailAddress',
            role: 'Metadata/RoleName/Translation/en',
            accountStatus: 'Entity/AccountStatus',
            edit: 'edit',
            delete: 'delete',
          },
        );
      });
    });

    describe('tableProps', () => {
      it('is correctly defined', async () => {
        await mountWrapper();
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps).toEqual({
          loading: wrapper.vm.loading,
          footerProps: { itemsPerPageOptions: [5, 10, 15, 250] },
        });
      });
    });

    describe('labels', () => {
      it('is correctly defined', async () => {
        mountWrapper();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'system_management.leftMenu.user_accounts_title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'system_management.userAccounts.add_user_account_title',
          },
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      mountWrapper();
    });

    describe('fetchData', () => {
      it('should call search with proper params', () => {
        const params = {
          search: 'query',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };

        wrapper.vm.combinedUserAccountStore.search = jest.fn();

        wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedUserAccountStore.search).toBeCalledWith({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });
    });

    describe('addUser', () => {
      it('toggles visibility of Add EMIS USer dialog', () => {
        wrapper.vm.showAddEmisUserDialog = false;
        wrapper.vm.showAddUserAccountDialog = false;
        wrapper.vm.addUser();
        wrapper.vm.$nextTick();
        expect(wrapper.vm.showAddEmisUserDialog).toEqual(true);
        expect(wrapper.vm.showAddUserAccountDialog).toEqual(false);
      });

      // FeatureKey.UseIdentityServer
      it('toggles visibility of Add EMIS User dialog from menu shown with FF on', () => {
        wrapper.vm.showAddEmisUserDialog = false;
        wrapper.vm.showAddUserAccountDialog = false;
        wrapper.vm.addUser({ value: 'activeDirectory' });
        wrapper.vm.$nextTick();
        expect(wrapper.vm.showAddEmisUserDialog).toEqual(true);
        expect(wrapper.vm.showAddUserAccountDialog).toEqual(false);
      });

      it('toggles visibility of Add User Account dialog from menu shown with FF on', () => {
        wrapper.vm.showAddEmisUserDialog = false;
        wrapper.vm.showAddUserAccountDialog = false;
        wrapper.vm.addUser({ value: 'standard' });
        wrapper.vm.$nextTick();
        expect(wrapper.vm.showAddEmisUserDialog).toEqual(false);
        expect(wrapper.vm.showAddUserAccountDialog).toEqual(true);
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
        wrapper.vm.search = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        userAccountStore.assignRole = jest.fn(() => changedUser.entity);
        wrapper.vm.getSubRoleById = jest.fn(() => fakeSubRole);
        await wrapper.vm.applyRoleChange(user);

        expect(userAccountStore.assignRole).toHaveBeenCalledWith({ subRole: fakeSubRole, userId: user.entity.id });
        expect(wrapper.vm.search).toHaveBeenCalledWith(wrapper.vm.params);
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
        userAccountStore.deactivate = jest.fn(() => {});
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.clearDeletionStatus = jest.fn();
        wrapper.vm.search = jest.fn();

        const user = { entity: { id: '12345', accountStatus: AccountStatus.Active, status: Status.Active } };
        wrapper.vm.userToDelete = user;
        userAccountStore.deactivate = jest.fn(() => user.entity);

        await wrapper.vm.applyDeleteUserAccount();

        expect(userAccountStore.deactivate).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.search).toHaveBeenCalledWith(wrapper.vm.params);
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
        });
      });

      it('return false if current user is level 6', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
          pinia: getPiniaForUser(UserRoles.level5),
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
          pinia: getPiniaForUser(UserRoles.level5),
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
