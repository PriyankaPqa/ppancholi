import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockUserAccountEntity, mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import { mockUsersData, User } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './AccountSettings.vue';

const localVue = createLocalVue();

const storage = mockStorage();
const mockUser = mockUserAccountEntity({ id: '1' });
const mockUserMetadata = mockUserAccountMetadata({ id: '1' });
const { pinia, userAccountStore, userAccountMetadataStore } = useMockUserAccountStore();

let userStore;

describe('AccountSettings.vue', () => {
  let wrapper;
  userAccountStore.roles = jest.fn(() => mockOptionItemData());

  const doMount = async (id = null, emptyUser = false) => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      computed: {
        user: () => (emptyUser ? {} : mockUser),
        userMetadata: () => (emptyUser ? {} : mockUserMetadata),
        basicUserData: () => new User(mockUsersData()[0]),
      },
      mocks: {
        $storage: storage,
        $route: {
          params: {
            id,
          },
        },
      },
    });

    userStore = useUserStore();
    userStore.getUser = jest.fn(() => new User(mockUsersData()[0]));
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
        expect(element.props('status')).toEqual(wrapper.vm.user.accountStatus);
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

      it('contains the right data', async () => {
        expect(element.text()).toEqual(wrapper.vm.userMetadata.givenName);
      });

      it('contains the right data - no user', async () => {
        await doMount(null, true);
        element = wrapper.findDataTest('userAccount-status-firstName');
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

      it('contains the right data', async () => {
        expect(element.text()).toEqual(wrapper.vm.userMetadata.surname);
      });

      it('contains the right data - no user', async () => {
        await doMount(null, true);
        element = wrapper.findDataTest('userAccount-status-lastName');
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
        expect(element.text()).toEqual(wrapper.vm.userMetadata.roleName.translation.en);
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
        expect(element.text()).toEqual(wrapper.vm.userMetadata.emailAddress);
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
        expect(element.text()).toEqual(wrapper.vm.userMetadata.phoneNumber);
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

  describe('Created', () => {
    it('calls fetch', async () => {
      jest.clearAllMocks();
      await doMount('id');
      userAccountStore.fetch = jest.fn();
      userAccountMetadataStore.fetch = jest.fn();
      const hook = wrapper.vm.$options.created[0];
      await hook.call(wrapper.vm);
      expect(userAccountStore.fetch).toHaveBeenCalledWith('id');
      expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('id', false);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        mocks: {
          $storage: storage,
        },
        store: {
          userAccount: {
            searchLoading: false,
          },
        },
      });
      userStore = useUserStore();
      userStore.getUser = jest.fn(() => new User(mockUsersData()[0]));
    });

    describe('basicUserData', () => {
      it('returns user data from the user store', () => {
        expect(wrapper.vm.basicUserData).toEqual(new User(mockUsersData()[0]));
      });
    });

    describe('user', () => {
      it('return the user account by id from the storage', () => {
        userAccountStore.getById = jest.fn(() => mockUser);
        userAccountStore.fetch = jest.fn(() => mockUserAccountEntity({ id: '1' }));
        expect(wrapper.vm.user).toEqual(mockUser);
      });
    });

    describe('preferredLanguage', () => {
      it('returns English if includes en', () => {
        const userMetadata = mockUserAccountMetadata({ preferredLanguage: 'en-CA' });
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            userMetadata() {
              return userMetadata;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.English (en-CA)');
      });

      it('returns Français if includes fr', () => {
        const userMetadata = mockUserAccountMetadata({ preferredLanguage: 'fr-CA' });
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            userMetadata() {
              return userMetadata;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.French (fr-CA)');
      });

      it('returns undefined if is null', () => {
        const userMetadata = mockUserAccountMetadata({ preferredLanguage: null });
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            userMetadata() {
              return userMetadata;
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
