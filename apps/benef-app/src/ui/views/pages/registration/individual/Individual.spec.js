import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { createTestingPinia } from '@pinia/testing';
import { tabs } from '@/pinia/registration/tabs';
import { mockProvider } from '@/services/provider';
import { FeatureKeys } from '@libs/entities-lib/src/tenantSettings';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import helpers from '@libs/entities-lib/helpers';
import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import Component from './Individual.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
useMockRegistrationStore(pinia);

describe('Individual.vue', () => {
  let wrapper;

  const doMount = async (fullmount = false, otherComputed = {}, featureList = []) => {
    wrapper = (fullmount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      featureList,
      mocks: {
        $services: services,
      },
      stubs: ['i18n', 'google-recaptcha', 'privacy-statement',
        'current-address-form', 'address-form', 'personal-information', 'personal-information-template'],
      computed: {
        ...otherComputed,
      },
    });
    await wrapper.vm.$nextTick();
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Lifecycle', () => {
    describe('Event handlers', () => {
      beforeEach(async () => {
        await doMount();
      });
      it('connects and disconnects to event hub on created/destroyed', async () => {
        EventHub.$on = jest.fn();
        EventHub.$off = jest.fn();
        jest.clearAllMocks();
        wrapper.vm.$options.created[0].call(wrapper.vm);
        expect(EventHub.$on).toHaveBeenCalledWith('fetchPublicToken', wrapper.vm.fetchPublicToken);
        expect(EventHub.$on).toHaveBeenCalledWith('next', wrapper.vm.goNext);

        jest.clearAllMocks();
        wrapper.vm.$options.destroyed[1].call(wrapper.vm);
        expect(EventHub.$off).toHaveBeenCalledWith('fetchPublicToken', wrapper.vm.fetchPublicToken);
        expect(EventHub.$off).toHaveBeenCalledWith('next', wrapper.vm.goNext);
      });

      it('connects and disconnects to event hub on created/destroyed for recaptchaSubmit render on setLanguage', async () => {
        EventHub.$on = jest.fn();
        EventHub.$off = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
        tenantSettingsStore.recaptcha = {
          ipAddressIsAllowed: false,
          clientIpAddress: '',
        };

        jest.clearAllMocks();
        wrapper.vm.$options.created[0].call(wrapper.vm);
        expect(EventHub.$on).toHaveBeenCalledWith('setLanguage', wrapper.vm.renderRecaptcha);

        jest.clearAllMocks();
        wrapper.vm.$options.destroyed[1].call(wrapper.vm);
        expect(EventHub.$off).toHaveBeenCalledWith('setLanguage', wrapper.vm.renderRecaptcha);
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(async () => {
        await doMount(true);
      });
      it('Click back button triggers method', async () => {
        wrapper.vm.back = jest.fn();

        const btn = wrapper.findDataTest('backButton');
        await btn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });

      it('Click next button triggers method', async () => {
        wrapper.vm.goNext = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        const btn = wrapper.findDataTest('nextButton');
        await btn.trigger('click');

        expect(wrapper.vm.goNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('Google recaptcha', () => {
      let element;

      it('google recaptcha is shown if BotProtection is enabled and if ip address is not in allowed list', async () => {
        await doMount(true, {
          isCaptchaAllowedIpAddress: () => false,
        }, [FeatureKeys.BotProtection]);

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeTruthy();
      });

      it('google recaptcha is not shown if BotProtection is disabled', async () => {
        await doMount(true, {
          isCaptchaAllowedIpAddress: () => false,
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeFalsy();
      });

      it('google recaptcha is not shown if ip address is in allowed list', async () => {
        await doMount(true, {
          isCaptchaAllowedIpAddress: () => true,
        });

        element = wrapper.findDataTest('google-recaptcha');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await doMount();
    });
    describe('back', () => {
      it('back calls jump', async () => {
        wrapper.vm.$registrationStore.currentTabIndex = 2;
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(1);
      });
    });

    describe('skipAuthentication', () => {
      it('calls next if confirmed', async () => {
        wrapper.vm.next = jest.fn();
        await wrapper.vm.skipAuthentication();
        expect(wrapper.vm.next).toHaveBeenCalled();

        jest.clearAllMocks();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.skipAuthentication();
        expect(wrapper.vm.next).not.toHaveBeenCalled();
      });
    });

    describe('restartAuthentication', () => {
      it('sets tier2ProcessStarted to false and emits', async () => {
        EventHub.$emit = jest.fn();
        await wrapper.setData({ tier2ProcessStarted: true });
        await wrapper.vm.restartAuthentication();
        expect(EventHub.$emit).toHaveBeenCalledWith('tier2ProcessReset');
        expect(wrapper.vm.tier2ProcessStarted).toBeFalsy();
      });
    });

    describe('validateAndNext', () => {
      it('if valid, calls next if not tier2auth tab and not tier2ProcessStarted', async () => {
        EventHub.$emit = jest.fn();
        helpers.timeout = jest.fn();
        wrapper.vm.next = jest.fn();
        await wrapper.setData({ localSubmitLoading: true });

        wrapper.vm.validateForm = jest.fn(() => false);
        await wrapper.vm.validateAndNext();
        expect(EventHub.$emit).not.toHaveBeenCalled();
        expect(wrapper.vm.next).not.toHaveBeenCalled();
        expect(wrapper.vm.localSubmitLoading).toBeFalsy();

        jest.clearAllMocks();
        wrapper.vm.validateForm = jest.fn(() => true);
        await wrapper.vm.validateAndNext();
        expect(EventHub.$emit).not.toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalled();

        jest.clearAllMocks();
        await wrapper.setData({ localSubmitLoading: true });
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ ...tabs()[0], id: TabId.Tier2auth }));
        await wrapper.vm.validateAndNext();
        expect(EventHub.$emit).toHaveBeenCalledWith('tier2ProcessStart');
        expect(wrapper.vm.next).not.toHaveBeenCalled();
        expect(wrapper.vm.tier2ProcessStarted).toBeTruthy();
        expect(wrapper.vm.localSubmitLoading).toBeFalsy();

        jest.clearAllMocks();
        await wrapper.vm.validateAndNext();
        expect(EventHub.$emit).not.toHaveBeenCalled();
        expect(wrapper.vm.next).toHaveBeenCalled();
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
        'should fetch token if this is a Tier 2 link process starting',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.BotProtection);
          tenantSettingsStore.recaptcha = {
            ipAddressIsAllowed: false,
            clientIpAddress: '',
          };

          wrapper.vm.$registrationStore.currentTabIndex = 1;
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ id: TabId.Tier2auth }));
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(0);

          wrapper.vm.$registrationStore.currentTabIndex = 0;
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ id: 'some other' }));
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(0);

          wrapper.vm.$registrationStore.currentTabIndex = 0;
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ id: TabId.Tier2auth }));
          await wrapper.vm.goNext();
          expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$hasFeature).toHaveBeenCalledWith('BotProtection');
          expect(wrapper.vm.localSubmitLoading).toBeTruthy();
        },
      );
      it(
        'should called execute from recaptcha if on personalInfo stage and BotProtection is enabled and if ip address is not in allowed list',
        async () => {
          wrapper.vm.$refs.recaptchaSubmit = {};
          wrapper.vm.validateAndNext = jest.fn();
          wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === TabId.PersonalInfo));
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
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === TabId.AdditionalMembers));
        await wrapper.vm.goNext();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });

    describe('renderRecaptcha', () => {
      it('should call render method from recaptcha with proper language parameter', async () => {
        wrapper.vm.$refs.recaptchaSubmit = {};
        wrapper.vm.$refs.recaptchaSubmit.render = jest.fn();

        await wrapper.vm.renderRecaptcha('en');
        expect(wrapper.vm.$refs.recaptchaSubmit.render).toHaveBeenCalledWith('en');
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
      it('calls the store, jumps to review and disables other tabs', async () => {
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
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === TabId.PersonalInfo));
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
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === TabId.PersonalInfo));
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
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => tabs().find((t) => t.id === TabId.PersonalInfo));
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
        expect(wrapper.vm.jump).toHaveBeenCalledWith(wrapper.vm.allTabs.findIndex((x) => x.id === TabId.Confirmation));
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
