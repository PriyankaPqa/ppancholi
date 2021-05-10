import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockAppUserData, mockRolesData, mockAppUserAzureData } from '@/entities/app-user';
import Component from './AddEmisUser.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const usersTestData = [
  { displayName: 'C' },
  { displayName: 'B' },
  { displayName: 'A' },
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
        show: true,
      },
      data() {
        return {
          error: false,
          formReady: false,
          searchTerm: '',
          allUsers: [],
          allRoles: [],
          searchResults: [],
          selectedUsers: [],
          isDirty: false,
          componentKey: 0,
          loading: false,
          submitButtonEnabled: true,
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Mounted', () => {
    it('loads lookup lists', async () => {
      jest.spyOn(wrapper.vm, 'fetchAllEMISUsers').mockImplementation(() => true);
      jest.spyOn(wrapper.vm, 'loadAllRoles').mockImplementation(() => true);

      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.fetchAllEMISUsers).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.loadAllRoles).toHaveBeenCalledTimes(1);
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
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        data() {
          return {
            error: false,
            formReady: false,
            searchTerm: '',
            allUsers: [],
            allRoles: [],
            searchResults: [],
            selectedUsers: [],
            isDirty: false,
            componentKey: 0,
            loading: false,
            submitButtonEnabled: false,
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

    describe('getClassRow', () => {
      it('returns row_disabled if the user is already in the team', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEMIS').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEMIS').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInEMIS').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('sortOnDisplayName', () => {
      it('returns Users in ascending alphabetical order by displayName', () => {
        expect(optionData[0].id).toEqual('1');
        expect(optionData[1].id).toEqual('2');
        wrapper.vm.sortOnLocaleName(optionData);
        expect(optionData[0].id).toEqual('2');
        expect(optionData[1].id).toEqual('1');
      });
    });

    describe('sortOnLocaleName', () => {
      it('returns Users in ascending alphabetical order by displayName', () => {
        wrapper.vm.sortOnDisplayName(usersTestData);
        expect(usersTestData[0].displayName).toEqual('A');
        expect(usersTestData[1].displayName).toEqual('B');
        expect(usersTestData[2].displayName).toEqual('C');
      });
    });

    describe('isAlreadyInEmis', () => {
      it('returns true for a user that is in the allUsers array', () => {
        wrapper.vm.allUsers = usersTestData;
        expect(wrapper.vm.isAlreadyInEMIS(usersTestData[0])).toBeTruthy();
      });
      it('returns false for a user that is not in the allUsers array', () => {
        wrapper.vm.allUsers = usersTestData;
        expect(wrapper.vm.isAlreadyInEMIS({ displayName: 'Some Person', id: '9393-39393-39393-help' })).toBeFalsy();
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

    describe('fetchAllEMISUsers', () => {
      it('appUsers.fetchAppUsers has been called and formReady is true', async () => {
        wrapper.vm.$storage.appUser.actions.fetchAppUsers = jest.fn(() => mockAppUserAzureData());
        wrapper.vm.fetchAllEMISUsers();
        expect(wrapper.vm.$storage.appUser.actions.fetchAppUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.formReady).toBeTruthy();
      });
    });

    describe('loadAllRoles', () => {
      it('data and element alphabetic ordering are correct', async () => {
        wrapper.vm.$services.appUsers.fetchRoles = jest.fn(() => mockRolesData());
        wrapper.vm.loadAllRoles();
        expect(wrapper.vm.$services.optionItems.getOptionList).toHaveBeenCalled();
      });
    });

    describe('findUsers', () => {
      it('empty results with no search term', async () => {
        jest.spyOn(wrapper.vm.$services.appUsers, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = '';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$data.isDirty).toBeFalsy();
        expect(wrapper.vm.$data.searchResults).toEqual([]);
      });

      it('correct service call with valid search term', async () => {
        jest.spyOn(wrapper.vm.$services.appUsers, 'findAppUsers').mockImplementation(() => mockAppUserData());
        wrapper.vm.searchTerm = 't';
        wrapper.vm.findUsers();
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$services.appUsers.findAppUsers).toHaveBeenCalledWith('t');
        expect(wrapper.vm.$data.isDirty).toBeTruthy();
      });
    });

    describe('toggleUserSelection', () => {
      const testUser = { id: '1234-1234-1234' };
      it('toggling unselected user adds it to selectedUsers array', async () => {
        wrapper.vm.updateSubmitButton = jest.fn();
        expect(wrapper.vm.isDirty).toBeFalsy();
        expect(wrapper.vm.selectedUsers).not.toContain(testUser);

        wrapper.vm.toggleUserSelection(testUser);
        expect(wrapper.vm.selectedUsers).toContain(testUser);
        expect(wrapper.vm.isDirty).toBeTruthy();
        expect(wrapper.vm.updateSubmitButton).toHaveBeenCalledTimes(1);
      });

      it('toggling selected user removes it from selectedUsers array', async () => {
        wrapper.vm.updateSubmitButton = jest.fn();
        wrapper.vm.selectedUsers.push(testUser);
        expect(wrapper.vm.isDirty).toBeFalsy();
        expect(wrapper.vm.selectedUsers).toContain(testUser);

        wrapper.vm.toggleUserSelection(testUser);
        expect(wrapper.vm.selectedUsers).not.toContain(testUser);
        expect(wrapper.vm.isDirty).toBeTruthy();
        expect(wrapper.vm.updateSubmitButton).toHaveBeenCalledTimes(1);
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        wrapper.vm.allUsers = mockAppUserData();
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
        wrapper.vm.allUsers = [];
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

    describe('assignRoleToUser', () => {
      it('updates selected user with correct role and enables submit button', () => {
        wrapper.vm.selectedUsers = [...mockAppUserData()];
        wrapper.vm.selectedUsers[0].roles = [];
        expect(wrapper.vm.submitButtonEnabled).toBeFalsy();
        wrapper.vm.assignRoleToUser(optionData[0], wrapper.vm.selectedUsers[0]);
        expect(wrapper.vm.selectedUsers[0].roles[0]).toEqual(
          {
            id: optionData[0].subitems[0].id,
            displayName: optionData[0].subitems[0].name.translation.en,
            value: null,
          },
        );
        expect(wrapper.vm.submitButtonEnabled).toBeTruthy();
      });
    });

    describe('updateSubmitButton', () => {
      it('submit button goes from disabled to enabled when selected user is given a role', () => {
        wrapper.vm.selectedUsers = [...mockAppUserData()];
        wrapper.vm.selectedUsers[0].roles = [];
        expect(wrapper.vm.submitButtonEnabled).toBeFalsy();

        wrapper.vm.updateSubmitButton();
        expect(wrapper.vm.submitButtonEnabled).toBeFalsy();

        wrapper.vm.selectedUsers[0].roles.push(mockRolesData()[0]);
        wrapper.vm.updateSubmitButton();
        expect(wrapper.vm.submitButtonEnabled).toBeTruthy();
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
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn();
        wrapper.vm.submitButtonEnabled = false;
        wrapper.vm.submit();
        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalledTimes(0);
      });

      it('should call service once for each user', () => {
        wrapper.vm.$storage.userAccount.actions.addRoleToUser = jest.fn();
        wrapper.vm.selectedUsers = [mockAppUserData()[0], mockAppUserData()[1]];
        wrapper.vm.submitButtonEnabled = true;
        wrapper.vm.submit();
        expect(wrapper.vm.$storage.userAccount.actions.addRoleToUser).toHaveBeenCalledTimes(wrapper.vm.selectedUsers.length);
      });
    });
  });
});
