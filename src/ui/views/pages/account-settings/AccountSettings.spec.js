import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedUserAccount } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';

import Component from './AccountSettings.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockUser = mockCombinedUserAccount();

describe('AccountSettings.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          user() {
            return mockUser;
          },
        },
      });
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
        expect(element.text()).toEqual(wrapper.vm.user.metadata.givenName);
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
        expect(element.text()).toEqual(wrapper.vm.user.metadata.surname);
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

  describe('life cycle', () => {
    beforeEach(() => {
      storage.user.getters.userId = jest.fn(() => 'mock-id');
      storage.userAccount.actions.fetch = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    it('should get the id from the user storage ', () => {
      expect(wrapper.vm.$storage.user.getters.userId).toHaveBeenCalledTimes(1);
    });
    it('should call fetchCurrentUserAccount with the response of the user storage getter', () => {
      expect(wrapper.vm.$storage.userAccount.actions.fetch).toHaveBeenCalledWith('mock-id');
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

    describe('user', () => {
      it('return the user account by id from the storage', () => {
        expect(wrapper.vm.user).toEqual(mockUser);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        store: {
          userAccount: {
            searchLoading: false,
          },
        },
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('setPreferredLanguage', () => {
      it('should be called when changing language', () => {
        const element = wrapper.findDataTest('userAccount-language-preferences');
        wrapper.vm.setPreferredLanguage = jest.fn();
        element.vm.$emit('change', 'bar');
        expect(wrapper.vm.setPreferredLanguage).toHaveBeenCalledWith('bar');
      });
      it('should call setCurrentUserPreferredLanguage with correct param ', () => {
        wrapper.vm.setPreferredLanguage({ key: 'fr' });
        expect(wrapper.vm.$storage.userAccount.actions.setCurrentUserPreferredLanguage).toHaveBeenCalledWith('fr');
      });
    });
  });
});
