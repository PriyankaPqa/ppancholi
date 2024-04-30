import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';

import { mockProvider } from '@/services/provider';
import { mockUserProfileQueryResponse, mockUserProfileData } from '@libs/entities-lib/user-account';
import Component from './AddEmisUser.vue';

const { pinia, userAccountStore } = useMockUserAccountStore();
const localVue = createLocalVue();
const services = mockProvider();

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
    role: mockSubRole,
  },
  {
    id: '2',
    displayName: 'B',
    givenName: 'Other Person',
    surname: '',
    emailAddress: 'faker@email.com',
    phoneNumber: '123-456-5555',
    role: mockSubRole,
  },
  {
    id: '3',
    displayName: 'A',
    givenName: 'Another Person',
    surname: '',
    emailAddress: 'fakest@email.com',
    phoneNumber: '123-654-0987',
    role: mockSubRole,
  },
];
const optionData = [
  {
    id: '1',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
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

let wrapper;

const doMount = (shallow = true, otherOptions = {}) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      show: true,
      allSubRoles: [...optionData[0].subitems, ...optionData[1].subitems],
      allAccessLevelRoles: [],
    },
    data() {
      return {
        searchTerm: '',
        filteredActiveDirectoryUsers: [],
        filteredAppUsers: [],
        selectedUsers: [],
        loading: false,
        isSubmitAllowed: false,
      };
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
};

describe('AddEmisUser.vue', () => {
  describe('Computed', () => {
    beforeEach(() => doMount());
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

    describe('orderedUsers', () => {
      it('returns the right data', async () => {
        await wrapper.setData({ filteredActiveDirectoryUsers: [{ displayName: 'ZZ', id: '2' }, { displayName: 'AA', id: '1' }] });
        expect(wrapper.vm.orderedUsers).toEqual([{ displayName: 'AA', id: '1' }, { displayName: 'ZZ', id: '2' }]);
      });
    });

    describe('orderedSelectedUsers', () => {
      it('returns the right data', async () => {
        await wrapper.setData({ selectedUsers: [{ displayName: 'ZZ', id: '2' }, { displayName: 'AA', id: '1' }] });
        expect(wrapper.vm.orderedSelectedUsers).toEqual([{ displayName: 'AA', id: '1' }, { displayName: 'ZZ', id: '2' }]);
      });
    });
  });

  describe('Watch', () => {
    describe('searchTerm', () => {
      it('calls debounceSearch if there is a new value', async () => {
        doMount();
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.setData({ searchTerm: '' });
        expect(wrapper.vm.debounceSearch).not.toHaveBeenCalled();
        await wrapper.setData({ searchTerm: 'abc' });
        expect(wrapper.vm.debounceSearch).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
        await wrapper.setData({ searchTerm: '' });
        await wrapper.setData({ searchTerm: ' ' });
        expect(wrapper.vm.debounceSearch).not.toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setData({ searchTerm: '  ' });
        expect(wrapper.vm.debounceSearch).not.toHaveBeenCalled();
        await wrapper.setData({ searchTerm: 'abc ' });
        jest.clearAllMocks();
        await wrapper.setData({ searchTerm: 'abc' });
        expect(wrapper.vm.debounceSearch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => doMount());

    describe('close', () => {
      it('emit update:show with false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('fetchActiveDirectoryUsers', () => {
      it('calls searchDirectoryUsers', async () => {
        wrapper.vm.$services.userAccounts.searchDirectoryUsers = jest.fn(() => [appUsersTestData()[0]]);
        await wrapper.vm.fetchActiveDirectoryUsers('query');
        expect(wrapper.vm.$services.userAccounts.searchDirectoryUsers).toHaveBeenCalledWith('query');
      });

      it('maps the data by calling and saves the mapped data in filteredActiveDirectoryUsers ', async () => {
        const user = appUsersTestData()[0];
        const responseUser = mockUserProfileQueryResponse({
          id: user.id,
          emailAddress: user.emailAddress,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          givenName: user.givenName,
          surname: user.surname,
          preferredLanguage: user.preferredLanguage,
          userPrincipalName: user.userPrincipalName,
          existsInEmis: true,
        });
        const mappedUser = {
          ...responseUser,
          role: null,
        };
        wrapper.vm.$services.userAccounts.searchDirectoryUsers = jest.fn(() => [responseUser]);

        await wrapper.vm.fetchActiveDirectoryUsers('query');
        expect(wrapper.vm.filteredActiveDirectoryUsers).toEqual([mappedUser]);
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
        const user = { ...mockUserProfileData()[0], existsInEmis: true };
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        const user = { ...mockUserProfileData()[0], existsInEmis: false };
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        const user = { ...mockUserProfileData()[0], existsInEmis: false };
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        const testUsers = appUsersTestData();
        wrapper.vm.selectedUsers = testUsers;
        const items = [
          {
            id: '5',
            role: null,
            status: 1,
            accountStatus: 1,
            displayName: 'Test Brown',
            givenName: 'Test',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            existsInEmis: false,
          },
        ];
        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...testUsers, ...items]);
      });

      it('adds the users to the list without duplicates', () => {
        const testUsers = appUsersTestData();
        const item1 = {
          id: '5',
          role: null,
          status: 1,
          accountStatus: 1,
          displayName: 'Test Brown',
          givenName: 'Test',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test@test.com',
          existsInEmis: false,
        };

        const item2 = {
          id: '6',
          role: null,
          status: 1,
          accountStatus: 1,
          displayName: 'Test Brown 2',
          givenName: 'Test2',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test2@test.com',
          existsInEmis: false,
        };

        const items = [item1, item2];

        wrapper.vm.selectedUsers = [...testUsers, item1];

        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...testUsers, item1, item2]);
      });

      it('updates selectedUsers by removing unselected members', () => {
        const testUsers = appUsersTestData();
        wrapper.vm.searchResults = testUsers;
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'Test',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            role: null,
          },
        ];
        wrapper.vm.selectedUsers = [...testUsers, ...items];
        wrapper.vm.onSelectAll({ items, value: false });
        expect(wrapper.vm.selectedUsers).toEqual(testUsers);
      });
    });

    describe('assignRoleToUser', () => {
      it('updates selected user with correct role and enables submit button', () => {
        wrapper.vm.selectedUsers = [...appUsersTestData()];
        wrapper.vm.selectedUsers[0].role = null;
        expect(wrapper.vm.isSubmitAllowed).toBeFalsy();
        const roleData = { value: optionData[0].id, text: optionData[0].name };
        wrapper.vm.assignRoleToUser(roleData, wrapper.vm.selectedUsers[0]);
        expect(wrapper.vm.selectedUsers[0].role).toEqual(
          {
            id: optionData[0].id,
            displayName: optionData[0].name.translation.en,
            value: null,
          },
        );
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });

    describe('submit', () => {
      it('should not run if submit button is disabled', async () => {
        await wrapper.setData({
          selectedUsers: appUsersTestData(),
        });
        wrapper.vm.isSubmitAllowed = false;
        // userAccount.assignRole = jest.fn();
        await wrapper.vm.submit();
        expect(userAccountStore.assignRole).not.toHaveBeenCalled();
      });

      it('should call services correctly', async () => {
        wrapper.vm.isSubmitAllowed = true;
        userAccountStore.assignRole = jest.fn(() => usersTestData[0]);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].role = mockSubRole;
        await wrapper.vm.submit();

        expect(userAccountStore.assignRole).toHaveBeenCalled();
      });

      it('emits users-added', async () => {
        wrapper.vm.isSubmitAllowed = true;
        userAccountStore.assignRole = jest.fn((u) => u);
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].role = mockSubRole;
        await wrapper.vm.submit();
        wrapper.vm.$nextTick();

        expect(wrapper.emitted('users-added')).toBeTruthy();
        expect(userAccountStore.assignRole).toHaveBeenCalledTimes(1);
      });

      it('opens a toast on success', async () => {
        wrapper.vm.isSubmitAllowed = true;
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        userAccountStore.assignRole = jest.fn((u) => u);
        wrapper.vm.selectedUsers = [usersTestData()[0]];
        wrapper.vm.selectedUsers[0].role = mockSubRole;
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
        userAccountStore.assignRole = jest.fn(() => usersTestData()[0]);
        wrapper.vm.createUserAccount = jest.fn();
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);

        await wrapper.vm.setUserRole(wrapper.vm.selectedUsers[0]);
        wrapper.vm.$nextTick();

        expect(userAccountStore.assignRole).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('system_management.add_users.success');
      });

      it('emits error toast on null response', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        wrapper.vm.selectedUsers = [appUsersTestData()[0], appUsersTestData()[1]];
        wrapper.vm.getSubRoleById = jest.fn(() => mockSubRole);
        userAccountStore.assignRole = jest.fn(() => null);
        wrapper.vm.selectedUsers[0].role = mockSubRole;

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
        wrapper.vm.selectedUsers[0].role = { id: '123' };
        wrapper.vm.updateIsSubmitAllowed();
        expect(wrapper.vm.isSubmitAllowed).toBeTruthy();
      });
    });

    describe('debounceSearch', () => {
      it('should call fetchAppUsers and fetchActiveDirectoryUsers', async () => {
        wrapper.vm.fetchActiveDirectoryUsers = jest.fn();
        wrapper.vm.debounceSearch('query');
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(wrapper.vm.fetchActiveDirectoryUsers).toHaveBeenCalledWith('query');
      });
    });
  });
});
