import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockUsersData } from '@/entities/user';
import routes from '@/constants/routes';
import Component from '../RightMenu.vue';
import authenticationProvider from '@/auth/AuthenticationProvider';

const localVue = createLocalVue();

describe('RightMenu.vue', () => {
  let wrapper;
  let actions;

  const mountWrapper = async (fullMount = false) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      store: {
        modules: {
          user: {
            actions,
            state: mockUsersData()[0],
          },
          dashboard: {
            state: {
              rightMenuVisible: true,
            },
          },
        },
      },
    });

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
  };

  beforeEach(async () => {
    actions = {
      signOut: jest.fn(() => true),
    };
    await mountWrapper(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('the avatar is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__avatar"]');

        expect(avatar.text()).toBe('JW');
      });

      test('the user name is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__userName"]');

        expect(avatar.text()).toBe('John White');
      });

      test('the email is displayed correctly', async () => {
        const avatar = wrapper.find('[data-test="rightMenu__email"]');

        expect(avatar.text()).toBe('test@test.ca');
      });

      test('the role is displayed correctly', async () => {
        const element = wrapper.find('[data-test="rightMenu__role"]');

        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('RoleName');
      });

      test('no role is displayed correctly ', async () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            modules: {
              user: {
                actions,
                state: mockUsersData()[10],
              },
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

    describe('Methods', () => {
      describe('changeTenant', () => {
        it('calls signin with correct tenant', async () => {
          await wrapper.setData({ currentTenantId: 'abcd' });
          await wrapper.vm.changeTenant();
          expect(authenticationProvider.signIn).toHaveBeenCalledWith(null, 'abcd');
        });
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

        expect(actions.signOut).toHaveBeenCalledTimes(1);
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
});
