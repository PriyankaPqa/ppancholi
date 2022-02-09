/**
 * @group ui/components/system-management
 */
import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockAppUserData, mockRolesData } from '@/entities/app-user';
import Component from './AddEmisUser.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockSubRole = {
  id: '123',
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
};

const usersTestData = () => [
  {
    entity: {
      id: '1',
      status: 1,
    },
    metadata: {
      id: '1',
      displayName: 'C',
      givenName: 'Some Person',
      surname: '',
      emailAddress: 'fake@email.com',
      phoneNumber: '123-456-7890',
    },
  },
  {
    entity: {
      id: '2',
      status: 1,
    },
    metadata: {
      id: '2',
      displayName: 'B',
      givenName: 'Another Person',
      surname: '',
      emailAddress: 'faker@email.com',
      phoneNumber: '123-456-5555',
    },
  },
  {
    entity: {
      id: '2',
      status: 1,
    },
    metadata: {
      id: '2',
      displayName: 'A',
      givenName: 'Other Person',
      surname: '',
      emailAddress: 'fakest@email.com',
      phoneNumber: '123-654-0987',
    },
  },
];

const appUsersTestData = () => [
  {
    id: '1',
    displayName: 'C',
    givenName: 'Some Person',
    surname: '',
    emailAddress: 'fake@email.com',
    phoneNumber: '123-456-7890',
    roles: [mockSubRole],
  },
  {
    id: '2',
    displayName: 'B',
    givenName: 'Other Person',
    surname: '',
    emailAddress: 'faker@email.com',
    phoneNumber: '123-456-5555',
    roles: [mockSubRole],
  },
  {
    id: '3',
    displayName: 'A',
    givenName: 'Another Person',
    surname: '',
    emailAddress: 'fakest@email.com',
    phoneNumber: '123-654-0987',
    roles: [mockSubRole],
  },
];

const optionData = [
  {
    id: '1',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    eTag: '',
    name: {
      translation: {
        en: 'Z',
        fr: 'Inundation',
      },
    },
    subitems: [
      {
        id: '123',
        name: {
          translation: {
            en: 'case worker 2',
            fr: 'case worker 2 fr',
          },
        },
      },
    ],
  }, {
    id: '2',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    eTag: '',
    name: {
      translation: {
        en: 'A',
        fr: 'Incendies',
      },
    },
    subitems: [
      {
        id: '456',
        name: {
          translation: {
            en: 'case worker 3',
            fr: 'case worker 3 fr',
          },
        },
      },
    ],
  },
];

describe('AddEmisUser.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      propsData: {
        allEmisUsers: [],
        show: true,
        allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
        allAccessLevelRoles: [],
      },
      data() {
        return {
          error: false,
          formReady: false,
          searchTerm: '',
          appUsers: [],
          searchResults: [],
          selectedUsers: [],
          componentKey: 0,
          loading: false,
          isSubmitAllowed: false,
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Mounted', () => {
    it('loads lookup lists', async () => {
      jest.spyOn(wrapper.vm, 'fetchAllAppUsers').mockImplementation(() => true);

      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.fetchAllAppUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'system_management.userAccounts.member_name',
            class: 'emis_member_header',
            filterable: false,
            sortable: true,
            value: 'displayName',
            width: '35%',
          },
          {
            text: 'system_management.userAccounts.member_email',
            class: 'emis_member_header',
            filterable: false,
            sortable: false,
            value: 'emailAddress',
          },
        ]);
      });
    });

    describe('loadingText', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.loadingText).toEqual('system_management.userAccounts.loading_users');
      });
    });

    describe('submitLabel', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.submitLabel).toEqual('common.add');
      });
    });

    describe('helpLink', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.helpLink).toEqual('zendesk.help_link.addEMISUser');
      });
    });

    describe('customColumns', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.customColumns).toEqual(
          {
            name: 'EventName/Translation/en',
            email: 'ResponseLevelName/Translation/en',
          },
        );
      });
    });

    describe('itemsPerPage', () => {
      it('gives correct default for empty list', async () => {
        wrapper.vm.searchResults = null;
        expect(wrapper.vm.itemsPerPage).toEqual(10);
      });
      it('gives correct value for populated list', async () => {
        wrapper.vm.searchResults = [{ name: 'me' }, { name: 'you' }];
        expect(wrapper.vm.itemsPerPage).toEqual(2);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          allEmisUsers: [],
          show: true,
          allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
          allAccessLevelRoles: [],
        },
        data() {
          return {
            error: false,
            formReady: false,
            searchTerm: '',
            appUsers: [],
            searchResults: [],
            selectedUsers: [],
            componentKey: 0,
            loading: false,
            isSubmitAllowed: false,
          };
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('close', () => {
      it('emit update:show with false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('back', () => {
      it('emit hide', () => {
        wrapper.vm.back();
        expect(wrapper.emitted('hide')).toBeTruthy();
      });
    });

    describe('fetchAllAppUsers', () => {
      it('appUsers.fetchAllAppUsers has been called and formReady is true', async () => {
        jest.spyOn(wrapper.vm.$storage.userAccount.actions, 'fetchAll').mockImplementation(() => usersTestData());
        wrapper.vm.fetchAllAppUsers();
        expect(wrapper.vm.$storage.userAccount.actions.fetchAll).toHaveBeenCalled();
        expect(wrapper.vm.formReady).toBeTruthy();
      });
    });

    describe('findUsers', () => {
      it('empty results with no search term', async () => {
        jest.spyOn(wrapper.vm.$services.appUsers, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = '';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$data.searchResults).toEqual([]);
      });

      it('correct service call with valid search term', async () => {
        jest.spyOn(wrapper.vm.$services.appUsers, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = 't';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledWith('t');
      });
    });

    describe('isAlreadyInEmis', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            allEmisUsers: usersTestData(),
            show: true,
            allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
            allAccessLevelRoles: [],
          },
          data() {
            return {
              appUsers: appUsersTestData,
            };
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      it('returns true for an active user that is in the appUsers and allEmisUsers arrays', () => {
        const tempUser = appUsersTestData()[0];
        tempUser.status = 1;
        expect(wrapper.vm.isAlreadyInEmis(tempUser)).toBeTruthy();
      });

      it('returns false for a user that is not in the appUsers array', () => {
        const testUser = {
          entity: {
            id: '9393-39393-39393-help',
          },
          metadata: {
            id: '9393-39393-39393-help',
            displayName: 'Some Person',
          },
        };
        wrapper.vm.appUsers = usersTestData();
        expect(wrapper.vm.isAlreadyInEmis({ id: testUser.entity.id })).toBeFalsy();
      });

      it('returns false for a user that is not in the allEmisUsers array', () => {
        wrapper.setProps({ allEmisUsers: usersTestData() });
        const testUser = { entity: { id: '9393-39393-39393-help' }, metadata: { displayName: 'Some Person', id: '9393-39393-39393-help' } };
        wrapper.vm.appUsers = usersTestData();
        expect(wrapper.vm.isAlreadyInEmis(testUser)).toBeFalsy();
      });
    });

    describe('isSelected', () => {
      const testUser = { metadada: { displayName: 'Some Person', id: '9393-39393-39393-asdf', mail: 'test@best.com' } };
      it('returns false for unselected User', async () => {
        wrapper.vm.selectedUsers = [];
        expect(wrapper.vm.isSelected(testUser)).toBeFalsy();
      });
      it('returns true for selected User', async () => {
        wrapper.vm.selectedUsers.push(testUser);
        expect(wrapper.vm.isSelected(testUser)).toBeTruthy();
      });
    });

    describe('toggleUserSelection', () => {
      const testUser = { entity: { id: '1234-1234-1234' } };
      it('toggling unselected user adds it to selectedUsers array', async () => {
        expect(wrapper.vm.selectedUsers).not.toContain(testUser);

        wrapper.vm.toggleUserSelection(testUser);
        expect(wrapper.vm.selectedUsers).toContain(testUser);
      });

      it('toggling selected user removes it from selectedUsers array', async () => {
        wrapper.vm.selectedUsers.push(testUser);
        expect(wrapper.vm.selectedUsers).toContain(testUser);

        wrapper.vm.toggleUserSelection(testUser);
        expect(wrapper.vm.selectedUsers).not.toContain(testUser);
      });
    });

    describe('getClassRow', () => {
      it('returns row_disabled if the user is already in the team', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEmis').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEmis').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEmis').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        wrapper.vm.appUsers = usersTestData();
        wrapper.vm.selectedUsers = appUsersTestData();
        const items = [
          {
            id: '5',
            roles: [],
            status: 1,
            accountStatus: 1,
            displayName: 'Test Brown',
            givenName: 'Test',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
          },
        ];
        wrapper.vm.isAlreadyInEmis = jest.fn(() => false);
        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...appUsersTestData(), ...items]);
      });

      it('adds the users to the list without duplicates', () => {
        wrapper.vm.appUsers = usersTestData();

        const item1 = {
          id: '5',
          roles: [],
          status: 1,
          accountStatus: 1,
          displayName: 'Test Brown',
          givenName: 'Test',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test@test.com',
        };

        const item2 = {
          id: '6',
          roles: [],
          status: 1,
          accountStatus: 1,
          displayName: 'Test Brown 2',
          givenName: 'Test2',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test2@test.com',
        };

        const items = [item1, item2];
        wrapper.vm.isAlreadyInEmis = jest.fn(() => false);

        wrapper.vm.selectedUsers = [...appUsersTestData(), item1];

        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...appUsersTestData(), item1, item2]);
      });

      it('updates selectedUsers by removing unselected members', () => {
        wrapper.vm.appUsers = [];
        wrapper.vm.searchResults = mockAppUserData();
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'Test',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            roles: [],
          },
        ];
        wrapper.vm.selectedUsers = [...mockAppUserData(), ...items];
        wrapper.vm.onSelectAll({ items, value: false });
        expect(wrapper.vm.selectedUsers).toEqual(mockAppUserData());
      });
    });

    describe('sortOnDisplayName', () => {
      it('returns Users in ascending alphabetical order by displayName', () => {
        const appUsers = appUsersTestData();
        expect(appUsers[0].id).toEqual('1');
        expect(appUsers[1].id).toEqual('2');
        expect(appUsers[2].id).toEqual('3');
        wrapper.vm.sortOnDisplayName(appUsers);
        expect(appUsers[0].id).toEqual('3');
        expect(appUsers[1].id).toEqual('2');
        expect(appUsers[2].id).toEqual('1');
      });
    });

    describe('assignRoleToUser', () => {
      it('updates selected user with correct role and enables submit button', () => {
        wrapper.vm.selectedUsers = [...appUsersTestData()];
        wrapper.vm.selectedUsers[0].roles = [];
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.assignRoleToUser(roleData, wrapper.vm.selectedUsers[0]);
        expect(wrapper.vm.selectedUsers[0].roles[0]).toEqual(
          {
            id: optionData[0].id,
            displayName: optionData[0].name.translation.en,
            value: null,
          },
        );
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });

    describe('allSelectedUsersHaveRole', () => {
      it('returns true for no selected users', () => {
        wrapper.vm.selectedUsers = [];
        expect(wrapper.vm.allSelectedUsersHaveRole()).toBeTruthy();
      });

      it('returns false if a selected user has no role', () => {
        wrapper.vm.selectedUsers = usersTestData();
        wrapper.vm.selectedUsers[0].roles = [];
        expect(wrapper.vm.allSelectedUsersHaveRole(wrapper.vm.selectedUsers)).toBeFalsy();
      });

      it('returns true if all selected users have roles', () => {
        wrapper.vm.selectedUsers = usersTestData();
        wrapper.vm.selectedUsers.forEach((user) => {
          user.roles = [mockRolesData[0]];
        });
        expect(wrapper.vm.allSelectedUsersHaveRole()).toBeTruthy();
      });
    });

    describe('submit', () => {
      it('should not run if submit button is disabled', () => {
        wrapper.vm.isSubmitAllowed = false;
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn();
        wrapper.vm.submit();
        expect(wrapper.vm.$storage.userAccount.actions.assignRole).not.toHaveBeenCalled();
      });

      it('should call services correctly', async () => {
        wrapper.vm.isSubmitAllowed = true;
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn(() => usersTestData[0]);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();

        expect(wrapper.vm.$storage.userAccount.actions.assignRole).toHaveBeenCalled();
      });

      it('emits users-added', async () => {
        wrapper.vm.isSubmitAllowed = true;
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn((u) => u);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();
        wrapper.vm.$nextTick();

        expect(wrapper.emitted('users-added')).toBeTruthy();
        expect(wrapper.vm.$storage.userAccount.actions.assignRole).toHaveBeenCalledTimes(1);
      });

      it('opens a toast on success', async () => {
        wrapper.vm.isSubmitAllowed = true;
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn((u) => u);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalled();
      });
    });

    describe('getSubRoleById', () => {
      it('retrieves the correct sub-role from a user', async () => {
        const user = usersTestData()[0];
        user.roleId = wrapper.vm.allSubRoles[0].id;
        expect(wrapper.vm.getSubRoleById(user.roleId)).toEqual(wrapper.vm.allSubRoles[0]);
      });
    });

    describe('setUserRole', () => {
      it('should call services correctly', async () => {
        wrapper.vm.selectedUsers = [appUsersTestData()[0], appUsersTestData()[1]];
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn(() => usersTestData()[0]);
        wrapper.vm.createUserAccount = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);

        const result = await wrapper.vm.setUserRole(wrapper.vm.selectedUsers[0]);
        wrapper.vm.$nextTick();

        expect(wrapper.vm.$storage.userAccount.actions.assignRole).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('system_management.add_users.success');
        expect(result).toEqual(wrapper.vm.$storage.userAccount.actions.fetch(wrapper.vm.selectedUsers[0].id));
      });

      it('emits error toast on null response', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        wrapper.vm.selectedUsers = [appUsersTestData()[0], appUsersTestData()[1]];
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn(() => null);
        wrapper.vm.selectedUsers[0].roles[0] = mockSubRole;

        await wrapper.vm.setUserRole(wrapper.vm.selectedUsers[0]);
        wrapper.vm.$nextTick();

        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('system_management.add_users.error');
      });
    });

    describe('updateIsSubmitAllowed', () => {
      it('return false for null selection list', async () => {
        wrapper.vm.selectedUsers = null;
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
      });
      it('return false for empty selection list', async () => {
        wrapper.vm.selectedUsers = [];
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
      });
      it('return false for populated list with no roles assigned', async () => {
        wrapper.vm.selectedUsers = usersTestData();
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
      });
      it('return true for populated list with roles assigned', async () => {
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].roles = [{ id: '123' }];
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });
  });
});
