import { RcRouterViewTransition } from '@libs/component-lib/components';
import { createLocalVue, mount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockDashboardStore } from '@/pinia/dashboard/dashboard.mock';
import { useMockNotificationStore } from '@/pinia/notification/notification.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from '../MainLayout.vue';
import AppHeader from '../AppHeader.vue';
import LeftMenu from '../LeftMenu.vue';
import GeneralHelpMenu from '../GeneralHelpMenu.vue';

const { pinia, dashboardStore } = useMockDashboardStore();
useMockNotificationStore(pinia);
useMockUserAccountStore(pinia);
useMockTenantSettingsStore(pinia);

describe('MainLayout.vue', () => {
  let wrapper;
  const localVue = createLocalVue();
  const services = mockProvider();

  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      mocks: {
        $services: services,
      },
    });
  });

  describe('template', () => {
    it('should consist of AppHeader component', async () => {
      expect(wrapper.findComponent(AppHeader)).toBeTruthy();
    });

    it('should consist of LeftMenu component', async () => {
      expect(wrapper.findComponent(LeftMenu)).toBeTruthy();
    });

    it('should consist of GeneralHelpMenu component', async () => {
      expect(wrapper.findComponent(GeneralHelpMenu)).toBeTruthy();
    });

    it('should consist of RcRouterViewTransition component', async () => {
      expect(wrapper.findComponent(RcRouterViewTransition)).toBeTruthy();
    });
  });

  describe('computed', () => {
    test('helpMenuLinks are correct', async () => {
      const helpLinks = [{
        to: 'zendesk.help_link.forgot_password',
        text: 'zendesk.question.forgot_password',
        test: 'zendesk-forgot-password',
      },
      {
        to: 'zendesk.help_link.select_language_preferences',
        text: 'zendesk.question.select_language_preferences',
        test: 'zendesk-select-language-preferences',
      },
      {
        to: 'zendesk.help_link.register_a_beneficiary',
        text: 'zendesk.question.register_a_beneficiary',
        test: 'zendesk-register-a-beneficiary',
      },
      {
        to: 'zendesk.help_link.create_case_note',
        text: 'zendesk.question.create_case_note',
        test: 'zendesk-create-case-note',
      }];
      expect(wrapper.vm.helpMenuLinks).toEqual(helpLinks);
    });
    it('should show when notification center visible is set', () => {
      dashboardStore.notificationCenterVisible = true;
      expect(wrapper.vm.showNotificationCenter).toBeTruthy();
    });
    it('should not show when notification center visible is not set', () => {
      dashboardStore.notificationCenterVisible = false;
      expect(wrapper.vm.showNotificationCenter).toBeFalsy();
    });
  });

  describe('methods', () => {
    test('updateMini set paddingLeft val', async () => {
      expect(wrapper.vm.paddingLeft).toBe(false);
      wrapper.vm.updateMini(true);
      expect(wrapper.vm.paddingLeft).toBe(true);
    });
  });
});
