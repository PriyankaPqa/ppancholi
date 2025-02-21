import { mockEventSummary } from '@libs/entities-lib/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import Component from '../AppHeader.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
const { registrationStore } = useMockRegistrationStore(pinia);
const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);

describe('AppHeader.vue', () => {
  let wrapper;
  registrationStore.getEvent = jest.fn(() => mockEventSummary());

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        pinia,
        localVue,
        mocks: {
          $services: services,
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
        pinia,
        mocks: {
          $services: services,
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
        expect(wrapper.vm.event).toEqual(mockEventSummary());
      });
    });
    describe('eventName', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.eventName).toEqual(mockEventSummary().name.translation.en);
      });
    });
    describe('eventPhoneNumber', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.eventPhoneNumber).toEqual(mockEventSummary().responseDetails?.assistanceNumber);
      });
    });
    describe('isLandingPage', () => {
      it('returns true if the route is landing page', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: { name: routes.landingPage.name },
            $services: services,
          },
        });
        expect(wrapper.vm.isLandingPage).toBeTruthy();
      });
    });
  });
});
