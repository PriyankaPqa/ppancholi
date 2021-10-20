import { RcRouterViewTransition } from '@crctech/component-library';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import routes from '@/constants/routes';
import Component from './SystemManagementLayout.vue';

const localVue = createLocalVue();

describe('SystemManagementLayout.vue', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $route: {
          name: '',
        },
      },
    });
  });

  describe('Template', () => {
    it('shows RcRouterViewTransition component', () => {
      expect(wrapper.findComponent(RcRouterViewTransition)).toBeTruthy();
    });

    it('shows PageTemplate component', () => {
      expect(wrapper.findComponent(PageTemplate)).toBeTruthy();
    });
  });

  describe('Computed', () => {
    describe('metaTitle', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaTitle).toBe('metaInfo.system_management.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.system_management.description');
      });
    });

    describe('showLeftMenu', () => {
      it('return false if we are on system management home page', async () => {
        wrapper.vm.$route.name = routes.systemManagement.home.name;
        expect(wrapper.vm.showLeftMenu).toBe(false);
      });

      it('return true otherwise', async () => {
        wrapper.vm.$route.name = 'other';
        expect(wrapper.vm.showLeftMenu).toBe(true);
      });
    });

    describe('tabs', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.tabs).toEqual([{
          text: 'system_management.leftMenu.lists_title',
          test: 'systemManagement__menu__optionsLists',
          to: routes.systemManagement.lists.name,
          exact: false,
          level: 'level6',
        }, {
          text: 'system_management.leftMenu.user_accounts_title',
          test: 'systemManagement__menu__userAccounts',
          to: routes.systemManagement.userAccounts.home.name,
          exact: false,
          level: 'level6',
        }, {
          text: 'system_management.lists.roles',
          test: 'systemManagement__menu__roles',
          to: routes.systemManagement.roles.name,
          exact: false,
          level: 'level6',
        }, {
          text: 'system_management.lists.branding',
          test: 'systemManagement__menu__branding',
          to: routes.systemManagement.branding.name,
          exact: false,
          level: 'level6',
        }, {
          text: 'system_management.lists.tenantSettings',
          test: 'systemManagement__menu__tenantSettings',
          to: routes.systemManagement.tenantSettings.name,
          exact: false,
          level: 'level6',
        }]);
      });
    });
  });
});
