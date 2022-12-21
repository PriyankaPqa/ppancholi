import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedTenantSettings } from '@libs/entities-lib/tenantSettings';
import routes from '@/constants/routes';
import { getPiniaForUser } from '@/pinia/user/user.spec';
import { useUserStore } from '@/pinia/user/user';
import Component from '../RightMenu.vue';

const localVue = createLocalVue();

const pinia = getPiniaForUser('level6');
const userStore = useUserStore(pinia);
userStore.signOut = jest.fn();

describe('RightMenu.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      store: {
        modules: {
          dashboard: {
            state: {
              rightMenuVisible: true,
            },
          },
        },
      },
    });
  };

  beforeEach(async () => {
    await mountWrapper(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('the avatar is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__avatar"]');

        expect(avatar.text()).toBe('OJ');
      });

      test('the user name is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__userName"]');

        expect(avatar.text()).toBe('Orange Jack');
      });

      test('the email is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__email"]');

        expect(avatar.text()).toBe('test@test.ca');
      });

      test('the role is displayed correctly', async () => {
        const element = wrapper.find('[data-test="rightMenu__role"]');

        expect(element.exists()).toBeTruthy();
        await wrapper.setData({
          userAccount: {
            metadata: {
              roleName: {
                translation: {
                  en: 'RoleName',
                },
              },
            },
          },
        });
        expect(element.text()).toEqual('RoleName');
      });

      test('no role is displayed correctly ', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia: getPiniaForUser('noRole'),
          store: {
            modules: {
              dashboard: {
                state: {
                  rightMenuVisible: true,
                },
              },
            },
          },
        });
        const role = wrapper.find('[data-test="rightMenu__role"]');

        expect(role.text()).toBe('rightmenu.noRoleAssigned');
      });

      test('The page contains the Accounts settings', () => {
        const element = wrapper.find('[data-test="account-settings"]');

        expect(element.exists()).toBe(true);
      });
    });

    describe('Event handlers', () => {
      test('rightMenu__tenantdd change event is attached to changeTenant', async () => {
        await mountWrapper();
        wrapper.vm.changeTenant = jest.fn();
        const dd = wrapper.findDataTest('rightMenu__tenantdd');
        await dd.vm.$emit('change');
        expect(wrapper.vm.changeTenant).toHaveBeenCalledTimes(1);
      });

      test('close button closes the sidebar', async () => {
        expect(wrapper.vm.$store.state.dashboard.rightMenuVisible).toBe(true);

        const button = wrapper.find('[data-test="closeButton"]');
        await button.trigger('click');

        expect(wrapper.vm.$store.state.dashboard.rightMenuVisible).toBe(false);
      });

      test('the logout button dispatches the logout action and redirects to the sign in page', async () => {
        const button = wrapper.find('[data-test="sign-out"]');

        await button.trigger('click');

        expect(userStore.signOut).toHaveBeenCalledTimes(1);
      });

      test('the account settings button redirects to account settings page', async () => {
        const button = wrapper.find('[data-test="account-settings"]');

        await button.trigger('click');

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.accountSettings.home.name });
      });

      test('the account settings button do nothing if we are already on account settings page', async () => {
        wrapper.vm.$route.name = routes.accountSettings.home.name;

        const button = wrapper.find('[data-test="account-settings"]');
        await button.trigger('click');

        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Methods', () => {
    describe('changeTenant', () => {
      it('changes the url to the one from the tenant', async () => {
        const oldWindowLoc = window.location;
        delete window.location;
        window.location = { href: '' };

        wrapper.vm.$storage.tenantSettings.getters.get = jest.fn(() => mockCombinedTenantSettings());
        await wrapper.setData({ currentTenantId: 'abcd' });
        wrapper.vm.changeTenant();
        expect(wrapper.vm.$storage.tenantSettings.getters.get).toHaveBeenCalledWith('abcd');
        expect(window.location.href).toEqual('https://emis domain en');

        window.location = oldWindowLoc;
      });
    });

    describe('logout', () => {
      it('should call unsubscribeAll from signalR', () => {
        wrapper.vm.logout();
        expect(wrapper.vm.$signalR.unsubscribeAll).toBeCalledTimes(1);
      });
    });
  });
});
