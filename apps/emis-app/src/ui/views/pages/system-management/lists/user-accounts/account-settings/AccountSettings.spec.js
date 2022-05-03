import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedUserAccount } from '@/entities/user-account';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockStorage } from '@/store/storage';
import { mockUsersData, User } from '@/entities/user';

import Component from './AccountSettings.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockUser = mockCombinedUserAccount();

describe('AccountSettings.vue', () => {
  let wrapper;
  storage.userAccount.getters.roles = jest.fn(() => mockOptionItemData());
  storage.userAccount.actions.fetchUserAccount = jest.fn(() => mockCombinedUserAccount());
  storage.userAccount.getters.get = jest.fn(() => mockCombinedUserAccount());
  storage.user.getters.user = jest.fn(() => new User(mockUsersData()[0]));

  const doMount = async () => {
    wrapper = mount(Component, {
      localVue,
      computed: {
        user: () => mockUser,
        basicUserData: () => new User(mockUsersData()[0]),
      },
      mocks: {
        $storage: storage,
      },
    });
  };

  describe('Template', () => {
    beforeEach(async () => {
      await doMount();
    });

    describe('status', () => {
      let element;

      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-chip');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.props('status')).toEqual(wrapper.vm.user.entity.accountStatus);
      });
    });

    describe('firstName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-firstName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.basicUserData.firstName);
      });
    });

    describe('lastName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-lastName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.basicUserData.lastName);
      });
    });

    describe('roleName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-roleName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        element = wrapper.findDataTest('userAccount-status-roleName');
        expect(element.text()).toEqual(wrapper.vm.user.metadata.roleName.translation.en);
      });
    });

    describe('email', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-email');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.emailAddress);
      });
    });

    describe('phoneNumber', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-phoneNumber');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.phoneNumber);
      });
    });

    describe('preferred language', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-language-preferences');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.userAccount.getters.get = jest.fn(() => mockUser);

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
        store: {
          userAccount: {
            searchLoading: false,
          },
        },
      });
    });

    describe('basicUserData', () => {
      it('returns user data from the user store', () => {
        expect(wrapper.vm.basicUserData).toEqual(new User(mockUsersData()[0]));
      });
    });

    describe('user', () => {
      it('return the user account by id from the storage', () => {
        expect(wrapper.vm.user).toEqual(mockUser);
      });
    });

    describe('preferredLanguage', () => {
      it('returns English if includes en', () => {
        const user = mockCombinedUserAccount({ preferredLanguage: 'en-CA' });
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return user;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.English (en-CA)');
      });

      it('returns Français if includes fr', () => {
        const user = mockCombinedUserAccount({ preferredLanguage: 'fr-CA' });
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return user;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.French (fr-CA)');
      });

      it('returns undefined if is null', () => {
        const user = mockCombinedUserAccount({ preferredLanguage: null });
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return user;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('account_settings.preferredLanguage.notSet');
      });
    });
  });
});
