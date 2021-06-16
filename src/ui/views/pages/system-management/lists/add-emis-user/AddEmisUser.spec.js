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
const usersTestData = [
  {
    id: '1',
    displayName: 'C',
    givenName: 'Some Person',
    surname: '',
    emailAddress: 'fake@email.com',
    phoneNumber: '123-456-7890',
  },
  {
    id: '2',
    displayName: 'B',
    givenName: 'Another Person',
    surname: '',
    emailAddress: 'faker@email.com',
    phoneNumber: '123-456-5555',
  },
  {
    id: '3',
    displayName: 'A',
    givenName: 'Other Person',
    surname: '',
    emailAddress: 'fakest@email.com',
    phoneNumber: '123-654-0987',
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
        jest.spyOn(wrapper.vm.$storage.userAccount.actions, 'fetchAllUserAccounts').mockImplementation(() => mockAppUserData());
        wrapper.vm.fetchAllAppUsers();
        expect(wrapper.vm.$storage.userAccount.actions.fetchAllUserAccounts).toHaveBeenCalled();
        expect(wrapper.vm.formReady).toBeTruthy();
      });
    });

    describe('findUsers', () => {
      it('empty results with no search term', async () => {
        jest.spyOn(wrapper.vm.$storage.appUser.actions, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = '';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$storage.appUser.actions.findAppUsers).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$data.searchResults).toEqual([]);
      });

      it('correct service call with valid search term', async () => {
        jest.spyOn(wrapper.vm.$storage.appUser.actions, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = 't';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$storage.appUser.actions.findAppUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.appUser.actions.findAppUsers).toHaveBeenCalledWith('t');
      });
    });

    describe('isAlreadyInEmis', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            allEmisUsers: usersTestData,
            show: true,
            allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
            allAccessLevelRoles: [],
          },
          data() {
            return {
              appUsers: usersTestData,
            };
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      it('returns true for an active user that is in the appUsers and allEmisUsers arrays', () => {
        const tempUser = usersTestData[0];
        wrapper.vm.appUsers = usersTestData;
        tempUser.accountStatus = 1;
        tempUser.status = 1;
        expect(wrapper.vm.isAlreadyInEmis(tempUser)).toBeTruthy();
      });

      it('returns false for a user that is not in the appUsers array', () => {
        const testUser = { displayName: 'Some Person', id: '9393-39393-39393-help' };
        wrapper.vm.allEmisUsers.push(testUser);

        expect(wrapper.vm.isAlreadyInEmis(
          {
            displayName: 'Some Person',
            id: '9393-39393-39393-help',
          },
        )).toBeFalsy();
      });

      it('returns false for a user that is not in the allEmisUsers array', () => {
        const testUser = { displayName: 'Some Person', id: '9393-39393-39393-help' };
        wrapper.vm.appUsers = usersTestData;
        expect(wrapper.vm.isAlreadyInEmis(testUser)).toBeFalsy();
      });
    });

    describe('isSelected', () => {
      const testUser = {
        id: '1234-1234-12324-asdf',
        displayName: 'Test User',
        mail: 'test@best.com',
      };
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
      const testUser = { id: '1234-1234-1234' };
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
        wrapper.vm.appUsers = mockAppUserData();
        wrapper.vm.selectedUsers = mockAppUserData();
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
        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...mockAppUserData(), ...items]);
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
        expect(usersTestData[0].id).toEqual('1');
        expect(usersTestData[1].id).toEqual('2');
        expect(usersTestData[2].id).toEqual('3');
        wrapper.vm.sortOnDisplayName(usersTestData);
        expect(usersTestData[0].id).toEqual('3');
        expect(usersTestData[1].id).toEqual('2');
        expect(usersTestData[2].id).toEqual('1');
      });
    });

    describe('assignRoleToUser', () => {
      it('updates selected user with correct role and enables submit button', () => {
        wrapper.vm.selectedUsers = [...mockAppUserData()];
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
        wrapper.vm.selectedUsers = mockAppUserData();
        wrapper.vm.selectedUsers[0].roles = [];
        expect(wrapper.vm.allSelectedUsersHaveRole(wrapper.vm.selectedUsers)).toBeFalsy();
      });

      it('returns true if all selected users have roles', () => {
        wrapper.vm.selectedUsers = mockAppUserData();
        wrapper.vm.selectedUsers.forEach((user) => { user.roles = [mockRolesData[0]]; });
        expect(wrapper.vm.allSelectedUsersHaveRole()).toBeTruthy();
      });
    });

    describe('submit', () => {
      it('should not run if submit button is disabled', () => {
        wrapper.vm.isSubmitAllowed = false;
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn();
        wrapper.vm.submit();
        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).not.toHaveBeenCalled();
      });

      it('should call services correctly', async () => {
        wrapper.vm.isSubmitAllowed = true;
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn();
        wrapper.vm.$storage.appUser.mutations.invalidateAppUserCache = jest.fn();
        wrapper.vm.$storage.appUser.mutations.invalidateAllUserCache = jest.fn();
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn(() => usersTestData[0]);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [usersTestData[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();

        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalled();
      });

      it('emits users-added', async () => {
        wrapper.vm.isSubmitAllowed = true;
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn((u) => u);
        wrapper.vm.$storage.appUser.mutations.invalidateAppUserCache = jest.fn();
        wrapper.vm.$storage.appUser.mutations.invalidateAllUserCache = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [mockAppUserData()[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();
        wrapper.vm.$nextTick();

        expect(wrapper.emitted('users-added')).toBeTruthy();
        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalledTimes(1);
      });

      it('opens a toast on success', async () => {
        wrapper.vm.isSubmitAllowed = true;
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn((u) => u);
        wrapper.vm.$storage.appUser.mutations.invalidateAppUserCache = jest.fn();
        wrapper.vm.$storage.appUser.mutations.invalidateAllUserCache = jest.fn();
        wrapper.vm.selectedUsers = [mockAppUserData()[0]];
        wrapper.vm.selectedUsers[0].roles = [mockSubRole];
        await wrapper.vm.submit();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalled();
      });
    });

    describe('getSubRoleById', () => {
      it('retrieves the correct sub-role from a user', async () => {
        const user = usersTestData[0];
        user.roleId = wrapper.vm.allSubRoles[0].id;
        expect(wrapper.vm.getSubRoleById(user.roleId)).toEqual(wrapper.vm.allSubRoles[0]);
      });
    });

    describe('setUserRole', () => {
      it('should call services correctly', async () => {
        wrapper.vm.selectedUsers = [mockAppUserData()[0], mockAppUserData()[1]];
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn(() => mockAppUserData()[0]);
        wrapper.vm.createUserAccount = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);

        await wrapper.vm.setUserRole(wrapper.vm.selectedUsers[0]);
        wrapper.vm.$nextTick();

        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('system_management.add_users.success');
      });

      it('emits error toast on null response', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        wrapper.vm.selectedUsers = [mockAppUserData()[0], mockAppUserData()[1]];
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn(() => null);

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
        wrapper.vm.selectedUsers = usersTestData;
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
      });
      it('return true for populated list with roles assigned', async () => {
        wrapper.vm.selectedUsers = [usersTestData[0]];
        wrapper.vm.selectedUsers[0].roles = [{ id: '123' }];
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });
  });
});
