import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockUsersData, User } from '@/entities/user';
import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import Component from './HomeNoRole.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HomeNoRole.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      storage.user.getters.user.mockReturnValueOnce(new User({ ...mockUsersData()[10] }));

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    it('displays proper title', () => {
      expect(wrapper.findDataTest('account_settings__title').text()).toEqual('dashboard.noRoles.welcome, Albert First');
    });

    it('displays proper title', () => {
      expect(wrapper.findDataTest('account_settings__subtitle').text()).toEqual('dashboard.noRoles.welcomeMessage');
    });

    it('displays proper label for action button', () => {
      expect(wrapper.findDataTest('account_settings__submit_label').text()).toEqual('dashboard.noRoles.leftMenuTitle');
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
      it('equals storage.user.getters.user', () => {
        const user = new User({ ...mockUsersData()[10] });
        storage.user.getters.user.mockReturnValueOnce(new User(user));

        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.user).toEqual(new User(user));
      });
    });
  });

  describe('Methods', () => {
    describe('redirect', () => {
      it('redirects to account setting page', () => {
        const user = new User({ ...mockUsersData()[10] });
        storage.user.getters.user.mockReturnValueOnce(new User(user));

        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.redirect();

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.accountSettings.home.name });
      });
    });
  });
});
