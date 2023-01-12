import { mockEvent } from '@libs/entities-lib/registration-event';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';

import { mockStorage } from '@/storage';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from '../AppHeader.vue';

const localVue = createLocalVue();
const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

describe('AppHeader.vue', () => {
  let wrapper;
  const storage = mockStorage();
  storage.registration.getters.event = jest.fn(() => mockEvent());

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        pinia,
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    test('The event name is displayed correctly', async () => {
      const element = wrapper.find('[data-test="registration-portal-toolbar-event-name"]');
      expect(element.exists()).toBe(true);
    });

    test('The event phone number is displayed correctly', async () => {
      const element = wrapper.find('[data-test="registration-portal-toolbar-event-phone-number"]');
      expect(element.exists()).toBe(true);
    });

    test('The language selector is displayed', async () => {
      const element = wrapper.find('[data-test="registration-portal-language-selector"]');
      expect(element.exists()).toBe(true);
    });

    describe('Help link', () => {
      it('should not be displayed', async () => {
        const icon = wrapper.find('[data-test="general-help-trigger"]');
        expect(icon.exists()).toBe(false);
      });

      it('is linked to the correct key', async () => {
        expect(wrapper.vm.helpLink).toBe('zendesk.beneficiary_registration.introduction');
      });

      // it('should trigger openHelp method', async () => {
      //   wrapper.vm.openHelp = jest.fn();
      //   const icon = wrapper.find('[data-test="general-help-trigger"]');
      //   icon.vm.$emit('click');
      //   expect(wrapper.vm.openHelp).toHaveBeenCalledTimes(1);
      // });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('logoUrl', () => {
      it('should return the logoUrl', () => {
        expect(wrapper.vm.logoUrl.startsWith(wrapper.vm.$services.tenantSettings.getLogoUrl('en'))).toBeTruthy();
      });
    });

    describe('branding', () => {
      it('should return the branding', () => {
        expect(wrapper.vm.branding).toEqual(tenantSettingsStore.getBranding());
      });
    });
    describe('event', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.event).toEqual(mockEvent());
      });
    });
    describe('eventName', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.eventName).toEqual(mockEvent().name.translation.en);
      });
    });
    describe('eventPhoneNumber', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.eventPhoneNumber).toEqual(mockEvent().responseDetails?.assistanceNumber);
      });
    });
    describe('isLandingPage', () => {
      it('returns true if the route is landing page', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
            $route: { name: routes.landingPage.name },
          },
        });
        expect(wrapper.vm.isLandingPage).toBeTruthy();
      });
    });
  });
});
