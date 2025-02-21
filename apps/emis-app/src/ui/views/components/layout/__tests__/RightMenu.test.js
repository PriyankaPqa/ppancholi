import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { useMockDashboardStore } from '@/pinia/dashboard/dashboard.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { mockUserAccountEntity } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { UserRoles } from '@libs/entities-lib/user';

import Component from '../RightMenu.vue';

const localVue = createLocalVue();

const initPinia = (userRole = UserRoles.level6) => {
  const pinia = getPiniaForUser(userRole);
  const { userStore } = useMockUserStore(pinia);
  const { dashboardStore } = useMockDashboardStore(pinia);
  const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
  const { userAccountStore, userAccountMetadataStore } = useMockUserAccountStore(pinia);

  return {
    pinia,
    userStore,
    dashboardStore,
    tenantSettingsStore,
    userAccountStore,
    userAccountMetadataStore,
  };
};

const {
  pinia,
  userStore,
  dashboardStore,
  tenantSettingsStore,
  userAccountStore,
  userAccountMetadataStore,
} = initPinia(UserRoles.level6);

describe('RightMenu.vue', () => {
  let wrapper;
  userAccountStore.getById = jest.fn(() => mockUserAccountEntity());

  const mountWrapper = async (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      ...otherOptions,
    });

    wrapper.vm.show = true;
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
        await mountWrapper(true, {
          computed: {
            userAccountMetadata: () => ({ roleName: {
              translation: {
                en: 'RoleName',
              },
            } }),
          },
        });
        const element = wrapper.find('[data-test="rightMenu__role"]');

        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('RoleName');
      });

      test('no role is displayed correctly ', async () => {
        const { pinia } = initPinia(UserRoles.no_role);
        wrapper = mount(Component, {
          localVue,
          pinia,
          computed: {
            show: { get() {
              return true;
            },
            set() {} },
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

  describe('Computed', () => {
    userStore.getUserId = jest.fn(() => 'id');

    it('should show when right menu visible is set', () => {
      dashboardStore.rightMenuVisible = true;
      expect(wrapper.vm.show).toBeTruthy();
    });

    it('should not show when right menu visible is not set', () => {
      dashboardStore.rightMenuVisible = false;
      expect(wrapper.vm.show).toBeFalsy();
    });

    it('should update store when show setter is called', () => {
      dashboardStore.rightMenuVisible = true;
      wrapper.vm.show = false;
      expect(dashboardStore.rightMenuVisible).toBeFalsy();
    });

    describe('userAccount', () => {
      it('should get data frome store this correct id', () => {
        expect(userAccountStore.getById).toHaveBeenCalledWith('id');
      });
    });

    describe('userAccountMetadata', () => {
      it('should get data frome store this correct id', () => {
        expect(userAccountMetadataStore.getById).toHaveBeenCalledWith('id');
      });
    });
  });

  describe('Methods', () => {
    describe('changeTenant', () => {
      it('changes the url to the one from the tenant', async () => {
        const oldWindowLoc = window.location;
        delete window.location;
        window.location = { href: '' };

        await wrapper.setData({ currentTenantId: 'abcd' });
        wrapper.vm.changeTenant();
        expect(tenantSettingsStore.getById).toHaveBeenCalledWith('abcd');
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

  describe('lifecycle', () => {
    describe('mounted', () => {
      it('should fetch data if user has access', async () => {
        userStore.getUser.hasRole = jest.fn(() => true);
        userStore.getUserId = jest.fn(() => 'id');
        await mountWrapper(true);

        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(userAccountStore.fetch).toHaveBeenCalledWith('id', false);
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('id', false);
        expect(tenantSettingsStore.fetchUserTenants).toHaveBeenCalled();
        expect(tenantSettingsStore.fetchAll).toHaveBeenCalled();
      });
    });
  });
});
