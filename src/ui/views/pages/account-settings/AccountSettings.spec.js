import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { UserAccount, mockUserAccountSearchData } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';

import Component from './AccountSettings.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockUser = new UserAccount(mockUserAccountSearchData()[0]);

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

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.firstName);
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
        expect(element.text()).toEqual(wrapper.vm.user.lastName);
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
        expect(element.text()).toEqual(wrapper.vm.user.roleName.translation.en);
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
        expect(element.text()).toEqual(wrapper.vm.user.email);
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
        expect(element.text()).toEqual(wrapper.vm.user.phoneNumber);
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
      storage.userAccount.actions.fetchUserAccount = jest.fn(() => {});

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
    it('should call fetchUserAccount with the response of the user storage getter', () => {
      expect(wrapper.vm.$storage.userAccount.actions.fetchUserAccount).toHaveBeenCalledWith('mock-id');
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.userAccount.getters.userAccountById = jest.fn(() => mockUser);

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

    describe('loading', () => {
      it('return the user account by id from the storage', () => {
        expect(wrapper.vm.loading).toEqual(false);
      });
    });
  });
});
