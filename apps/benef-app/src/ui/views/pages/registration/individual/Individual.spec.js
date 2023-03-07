import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { tabs } from '@/pinia/registration/tabs';
import { mockProvider } from '@/services/provider';
import Component from './Individual.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
useMockRegistrationStore(pinia);

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          pinia,
          localVue,
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
        });
      });
      test('Click back button triggers method', async () => {
        wrapper.vm.back = jest.fn();

        const btn = wrapper.findDataTest('backButton');
        await btn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });

      test('Click next button triggers method', async () => {
        wrapper.vm.next = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        const btn = wrapper.findDataTest('nextButton');
        await btn.trigger('click');

        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });

    describe('Google recaptcha', () => {
      let element;

      test('google recaptcha is shown if BotProtection is enabled and if ip address is not in allowed list', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => false,
          },
          mocks: {
            $hasFeature: () => true,
          },
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeTruthy();
      });

      test('google recaptcha is not shown if BotProtection is disabled', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => false,
          },
          mocks: {
            $hasFeature: () => false,
          },
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeFalsy();
      });

      test('google recaptcha is not shown if ip address is in allowed list', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => true,
          },
          mocks: {
            $hasFeature: () => true,
          },
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        mocks: {
          $services: services,
        },
      });
    });
    describe('back', () => {
      test('back calls jump', async () => {
        wrapper.vm.$registrationStore.currentTabIndex = 2;
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(1);
      });
    });

    describe('goNext', () => {
      it(
        'should called execute from recaptcha if on review stage and if BotProtection is enabled and if ip address is not in allowed list',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'review'));
          wrapper.vm.$hasFeature = jest.fn(() => true);
          tenantSettingsStore.recaptcha = {
            ipAddressIsAllowed: false,
            clientIpAddress: '',
          };
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$hasFeature).toHaveBeenCalledWith('BotProtection');
        },
      );
      it(
        'should called execute from recaptcha if on personalInfo stage and SelfRegistration is enabled and if BotProtection is enabled and if ip address is not in allowed list',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
          wrapper.vm.$hasFeature = jest.fn(() => true);
          tenantSettingsStore.recaptcha = {
            ipAddressIsAllowed: false,
            clientIpAddress: '',
          };
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$hasFeature).toHaveBeenCalledWith('BotProtection');
          expect(wrapper.vm.$hasFeature).toHaveBeenCalledWith('SelfRegistration');
        },
      );
      it('should call next from mixin otherwise', async () => {
        wrapper.vm.next = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'additionalMembers'));
        await wrapper.vm.goNext();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });

    describe('recaptchaCallBack', () => {
      it('should set the token and call validateAndNext', async () => {
        wrapper.vm.validateAndNext = jest.fn();
        await wrapper.vm.recaptchaCallBack('token');
        expect(wrapper.vm.recaptchaToken).toBe('token');
        expect(wrapper.vm.validateAndNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('validateAndNext', () => {
      it('calls checkForPossibleDuplicatePublic if on personalInfo stage and SelfRegistration is enabled', async () => {
        window.confirm = () => true;
        wrapper.vm.$services.households.checkForPossibleDuplicatePublic = jest.fn(() => ({
          duplicateFound: true,
          registeredToEvent: true,
        }));
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
        wrapper.vm.$hasFeature = jest.fn(() => true);
        wrapper.vm.next = jest.fn();
        await wrapper.vm.validateAndNext();
        expect(wrapper.vm.$services.households.checkForPossibleDuplicatePublic)
          .toHaveBeenCalledWith(wrapper.vm.event.id, wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary, wrapper.vm.recaptchaToken);
        // will change once be is implemented
        // expect(wrapper.vm.duplicateResult).toEqual(wrapper.vm.$services.households.checkForPossibleDuplicatePublic());
        expect(wrapper.vm.showDuplicateDialog).toBeTruthy();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(0);
      });
      it('doesnt call checkForPossibleDuplicatePublic if not personalInfo stage or SelfRegistration is not enabled', async () => {
        window.confirm = () => true;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
        wrapper.vm.$hasFeature = jest.fn(() => false);
        wrapper.vm.next = jest.fn();
        await wrapper.vm.validateAndNext();
        expect(wrapper.vm.$services.households.checkForPossibleDuplicatePublic).not.toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'review'));
        wrapper.vm.$hasFeature = jest.fn(() => true);
        await wrapper.vm.validateAndNext();
        expect(wrapper.vm.$services.households.checkForPossibleDuplicatePublic).not.toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });
  });
});
