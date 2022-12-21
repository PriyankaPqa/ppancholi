import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockUsersData, User } from '@libs/entities-lib/user';

import routes from '@/constants/routes';

import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/pinia/user/user';
import Component from './HomeNoRole.vue';

const localVue = createLocalVue();

let wrapper;
let store;
const doMount = (shallow = true) => {
  const options = {
    localVue,
    pinia: createTestingPinia({ stubActions: false }),
  };

  wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
  store = useUserStore();
};

describe('HomeNoRole.vue', () => {
  describe('Template', () => {
    beforeEach(() => {
      doMount();
      store.getUser = jest.fn(() => new User({ ...mockUsersData()[10] }));
    });

    it('displays proper title', () => {
      expect(wrapper.findDataTest('account_settings__title').text()).toEqual('noRoles.welcome, Albert First');
    });

    it('displays proper title', () => {
      expect(wrapper.findDataTest('account_settings__subtitle').text()).toEqual('noRoles.welcomeMessage');
    });

    it('displays proper label for action button', () => {
      expect(wrapper.findDataTest('account_settings__submit_label').text()).toEqual('noRoles.leftMenuTitle');
    });

    it('class redirect when clicking on button', async () => {
      jest.spyOn(wrapper.vm, 'redirect').mockImplementation(() => {});
      const button = wrapper.findDataTest('account_settings__submit');
      await button.trigger('click');
      expect(wrapper.vm.redirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed properties', () => {
    describe('user', () => {
      it('is linked to getUser', () => {
        const user = new User({ ...mockUsersData()[10] });
        store.getUser = jest.fn(() => new User(user));
        expect(wrapper.vm.user).toEqual(new User(user));
      });
    });
  });

  describe('Methods', () => {
    describe('redirect', () => {
      it('redirects to account setting page', () => {
        doMount();
        wrapper.vm.redirect();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.accountSettings.home.name });
      });
    });
  });
});
