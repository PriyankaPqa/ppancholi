import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { tabs } from '@/pinia/registration/tabs';
import { mockProvider } from '@/services/provider';
import { FeatureKeys } from '@libs/entities-lib/src/tenantSettings';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
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
          mocks: { $services: services },
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'privacy-statement',
            'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
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
        wrapper.vm.goNext = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        const btn = wrapper.findDataTest('nextButton');
        await btn.trigger('click');

        expect(wrapper.vm.goNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('Google recaptcha', () => {
      let element;

      test('google recaptcha is shown if BotProtection is enabled and if ip address is not in allowed list', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          featureList: [FeatureKeys.BotProtection],
          mocks: { $services: services },
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'privacy-statement',
            'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => false,
          },
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeTruthy();
      });

      test('google recaptcha is not shown if BotProtection is disabled', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: { $services: services },
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'privacy-statement',
            'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => false,
          },
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeFalsy();
      });

      test('google recaptcha is not shown if ip address is in allowed list', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          featureList: [FeatureKeys.BotProtection],
          mocks: { $services: services },
          stubs: ['i18n', 'vue-programmatic-invisible-google-recaptcha', 'privacy-statement',
            'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
          computed: {
            isCaptchaAllowedIpAddress: () => true,
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
        'should called execute from recaptcha if a token was already fetched and if BotProtection is enabled and if ip address is not in allowed list',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          await wrapper.setData({ tokenFetchedLast: new Date(2000, 1, 1) });
          wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
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
        'should called execute from recaptcha if on personalInfo stage and BotProtection is enabled and if ip address is not in allowed list',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
          wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
          tenantSettingsStore.recaptcha = {
            ipAddressIsAllowed: false,
            clientIpAddress: '',
          };
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$hasFeature).toHaveBeenCalledWith('BotProtection');
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

    describe('fetchPublicToken', () => {
      it('should call recaptcha if BotProtection is enabled and if ip address is not in allowed list', async () => {
        wrapper.vm.$refs.recaptchaSubmit = {};
        const nextFunc = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
        wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
        tenantSettingsStore.recaptcha = {
          ipAddressIsAllowed: false,
          clientIpAddress: '',
        };
        await wrapper.vm.fetchPublicToken(nextFunc);
        expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalled();
        expect(wrapper.vm.functionAfterToken).toBe(nextFunc);
        expect(nextFunc).not.toHaveBeenCalled();
      });

      it('should not call recaptcha if BotProtection is disabled', async () => {
        wrapper.vm.$refs.recaptchaSubmit = {};
        const nextFunc = jest.fn();
        wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
        tenantSettingsStore.recaptcha = {
          ipAddressIsAllowed: false,
          clientIpAddress: '',
        };
        await wrapper.vm.fetchPublicToken(nextFunc);
        expect(wrapper.vm.$refs.recaptchaSubmit.execute).not.toHaveBeenCalled();
        expect(wrapper.vm.functionAfterToken).toBeFalsy();
        expect(nextFunc).toHaveBeenCalled();
      });

      it('should not call recaptcha if was called recently', async () => {
        wrapper.vm.$refs.recaptchaSubmit = {};
        const nextFunc = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
        wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
        await wrapper.setData({ tokenFetchedLast: new Date() });
        tenantSettingsStore.recaptcha = {
          ipAddressIsAllowed: false,
          clientIpAddress: '',
        };
        await wrapper.vm.fetchPublicToken(nextFunc);
        expect(wrapper.vm.$refs.recaptchaSubmit.execute).not.toHaveBeenCalled();
        expect(wrapper.vm.functionAfterToken).toBeFalsy();
        expect(nextFunc).toHaveBeenCalled();

        jest.clearAllMocks();
        await wrapper.setData({ tokenFetchedLast: new Date(2000, 1, 1) });
        await wrapper.vm.fetchPublicToken(nextFunc);
        expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalled();
      });
    });

    describe('recaptchaCallBack', () => {
      it('should set the last date the token was fetched and call validateAndNext', async () => {
        const nextFunc = jest.fn();
        await wrapper.setData({ functionAfterToken: nextFunc });
        await wrapper.vm.recaptchaCallBack('token');
        expect(wrapper.vm.$services.households.getPublicToken).toHaveBeenCalledWith('token');
        expect(wrapper.vm.tokenFetchedLast).toBeTruthy();
        expect(nextFunc).toHaveBeenCalledTimes(1);
      });
    });

    describe('loadHousehold', () => {
      test('calls the store, jumps to review and disables other tabs', async () => {
        wrapper.vm.jump = jest.fn();
        wrapper.vm.disableOtherTabs = jest.fn();
        wrapper.vm.$registrationStore.loadHousehold = jest.fn();

        const details = { householdId: 'someId', verificationCode: 'someCode' };

        await wrapper.vm.loadHousehold(details);

        expect(wrapper.vm.jump).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.disableOtherTabs).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$registrationStore.loadHousehold).toHaveBeenCalledWith(details);
      });
    });

    describe('validateAndNextPersonalInfo_prepareValidation', () => {
      it('makes sure email validation occurs before continuing', async () => {
        EventHub.$emit = jest.fn();
        await wrapper.vm.validateAndNextPersonalInfo_prepareValidation();
        expect(EventHub.$emit).toHaveBeenCalledWith('resetEmailValidation');
        expect(EventHub.$emit).toHaveBeenCalledWith('checkEmailValidation', wrapper.vm.validateAndNextPersonalInfo);
      });
    });

    describe('validateAndNextPersonalInfo', () => {
      it('calls checkForPossibleDuplicatePublic if on personalInfo stage and SelfRegistration is enabled', async () => {
        window.confirm = () => true;
        wrapper.vm.$services.households.checkForPossibleDuplicatePublic = jest.fn(() => ({
          duplicateFound: true,
          maskedEmail: 'xxx@mail.com',
          registeredToEvent: false,
        }));
        wrapper.vm.tryDuplicateAssociation = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.SelfRegistration);
        wrapper.vm.next = jest.fn();
        await wrapper.vm.validateAndNextPersonalInfo();
        expect(wrapper.vm.$services.households.checkForPossibleDuplicatePublic)
          .toHaveBeenCalledWith(wrapper.vm.event.id, wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary);
        expect(wrapper.vm.tryDuplicateAssociation).toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(0);
      });
      it('doesnt call checkForPossibleDuplicatePublic if SelfRegistration is not enabled', async () => {
        window.confirm = () => true;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
        wrapper.vm.next = jest.fn();
        await wrapper.vm.validateAndNextPersonalInfo();
        expect(wrapper.vm.$services.households.checkForPossibleDuplicatePublic).not.toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });

      it('does not call tryDuplicateAssociation if no duplicate found', async () => {
        window.confirm = () => true;
        wrapper.vm.$services.households.checkForPossibleDuplicatePublic = jest.fn(() => ({
          duplicateFound: false,
          maskedEmail: 'xxx@mail.com',
          registeredToEvent: false,
        }));
        wrapper.vm.tryDuplicateAssociation = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === 'personalInfo'));
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.SelfRegistration);
        wrapper.vm.next = jest.fn();
        await wrapper.vm.validateAndNextPersonalInfo();
        expect(wrapper.vm.tryDuplicateAssociation).not.toHaveBeenCalled();
        expect(wrapper.vm.next).not.toHaveBeenCalled();
      });
    });

    describe('tryDuplicateAssociation', () => {
      it('jumps to confirmation if there is a duplicate error else it shows dialog', async () => {
        wrapper.vm.$registrationStore.isDuplicateError = () => true;
        wrapper.vm.jump = jest.fn();

        wrapper.vm.tryDuplicateAssociation();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(wrapper.vm.allTabs.findIndex((x) => x.id === 'confirmation'));
        expect(wrapper.vm.showDuplicateDialog).toBeFalsy();

        jest.clearAllMocks();
        wrapper.vm.$registrationStore.isDuplicateError = () => false;
        wrapper.vm.tryDuplicateAssociation();
        expect(wrapper.vm.jump).not.toHaveBeenCalled();
        expect(wrapper.vm.showDuplicateDialog).toBeTruthy();
      });
    });
  });
});
