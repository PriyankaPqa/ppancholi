import { extend } from 'vee-validate';
import { required, max } from 'vee-validate/dist/rules';
import helpers from '@libs/entities-lib/helpers';
import {
  mockContactInformation,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '@libs/entities-lib/src/household-create';
import { mockEvent } from '@libs/entities-lib/src/registration-event';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { MAX_LENGTH_MD } from '../../constants/validations';
import { createLocalVue, shallowMount, mount } from '../../test/testSetup';
import Component from './ContactInformationForm.vue';
import { mockProvider } from '../../provider';

extend('required', required);
extend('phone', required);
extend('max', max);
extend('customValidator', required);

const localVue = createLocalVue();
const services = mockProvider();
describe('ContactInformationForm.vue', () => {
  let wrapper;

  const doMount = (shallow = true, additionalOptions = {}) => {
    const options = {
      localVue,
      propsData: {
        form: mockContactInformation(),
        preferredLanguagesItems: mockPreferredLanguages(),
        primarySpokenLanguagesItems: mockPrimarySpokenLanguages(),
        personId: 'personId',
      },
      stubs: {
        'vue-programmatic-invisible-google-recaptcha': { template: '<div></div>' },
        ValidationObserver: false,
      },
      mocks: {
        $services: services,
      },
      ...additionalOptions,
    };

    if (shallow) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
    jest.clearAllMocks();
  };

  beforeEach(() => {
    doMount();

    wrapper.vm.$refs = {
      email: {
        validate: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    describe('preferredLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.preferredLanguagesItems).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('rules', () => {
      test('preferredLanguage', () => {
        expect(wrapper.vm.rules.preferredLanguage).toEqual({
          required: true,
        });
      });

      test('preferredLanguageOther', () => {
        expect(wrapper.vm.rules.preferredLanguageOther).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('primarySpokenLanguageOther', async () => {
        await wrapper.setData({
          formCopy: {
            primarySpokenLanguage: { isOther: false },
          },
        });
        expect(wrapper.vm.rules.primarySpokenLanguageOther).toEqual({
          required: false,
          max: MAX_LENGTH_MD,
        });

        await wrapper.setData({
          formCopy: {
            primarySpokenLanguage: { isOther: true },
          },
        });
        expect(wrapper.vm.rules.primarySpokenLanguageOther).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      test('homePhoneNumber', () => {
        doMount(true, {
          computed: {
            contactInfoRequired() {
              return true;
            },
          },
        });
        expect(wrapper.vm.rules.homePhoneNumber).toEqual({
          phone: true,
          requiredContactInfo: true,
        });
      });

      test('mobilePhoneNumber', () => {
        doMount(true, {
          computed: {
            contactInfoRequired() {
              return true;
            },
          },
        });

        expect(wrapper.vm.rules.mobilePhoneNumber).toEqual({
          phone: true,
          requiredContactInfo: true,
        });
      });

      test('alternatePhoneNumber', () => {
        doMount(true, {
          computed: {
            contactInfoRequired() {
              return true;
            },
          },
        });
        expect(wrapper.vm.rules.alternatePhoneNumber).toEqual({
          phone: true,
          requiredContactInfo: true,
        });
      });

      test('alternatePhoneNumberExtension', () => {
        expect(wrapper.vm.rules.alternatePhoneNumberExtension).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('email', async () => {
        doMount(true, {
          computed: {
            contactInfoRequired() {
              return true;
            },
          },
        });
        await wrapper.setData({
          emailValidator: {
            isValid: true,
            messageKey: 'messageKey',
          },
        });

        expect(wrapper.vm.rules.email).toEqual({
          requiredContactInfo: true,
          customValidator: {
            isValid: true,
            messageKey: 'messageKey',
          },
        });
      });
    });

    describe('emailLabel', () => {
      it('should return proper string', () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return true;
            },
          },
        });
        expect(wrapper.vm.emailLabel).toEqual('registration.personal_info.emailAddress*');
        doMount(true, {
          computed: {
            missingContactInfo() {
              return false;
            },
          },
        });
        expect(wrapper.vm.emailLabel).toEqual('registration.personal_info.emailAddress');
      });
    });

    describe('homePhoneNumberLabel', () => {
      it('should return proper string', () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return true;
            },
          },
        });
        expect(wrapper.vm.homePhoneNumberLabel).toEqual('registration.personal_info.homePhoneNumber*');
        doMount(true, {
          computed: {
            missingContactInfo() {
              return false;
            },
          },
        });
        expect(wrapper.vm.homePhoneNumberLabel).toEqual('registration.personal_info.homePhoneNumber');
      });
    });

    describe('mobilePhoneNumberLabel', () => {
      it('should return proper string', () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return true;
            },
          },
        });
        expect(wrapper.vm.mobilePhoneNumberLabel).toEqual('registration.personal_info.mobilePhoneNumber*');
        doMount(true, {
          computed: {
            missingContactInfo() {
              return false;
            },
          },
        });
        expect(wrapper.vm.mobilePhoneNumberLabel).toEqual('registration.personal_info.mobilePhoneNumber');
      });
    });

    describe('alternatePhoneNumberLabel', () => {
      it('should return proper string', () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return true;
            },
          },
        });
        expect(wrapper.vm.alternatePhoneNumberLabel).toEqual('registration.personal_info.alternatePhoneNumber*');
        doMount(true, {
          computed: {
            missingContactInfo() {
              return false;
            },
          },
        });
        expect(wrapper.vm.alternatePhoneNumberLabel).toEqual('registration.personal_info.alternatePhoneNumber');
      });
    });

    describe('hasAnyPhone', () => {
      it('should return true if homePhoneNumber is not empty', () => {
        wrapper.vm.formCopy.homePhoneNumber.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });

      it('should return true if mobilePhoneNumber is not empty', () => {
        wrapper.vm.formCopy.mobilePhoneNumber.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });

      it('should return true if alternatePhoneNumber is not empty', () => {
        wrapper.vm.formCopy.alternatePhoneNumber.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });
    });

    describe('isCRCRegistration', () => {
      it('returns correct value', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        expect(wrapper.vm.isCRCRegistration).toBe(true);

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        expect(wrapper.vm.isCRCRegistration).toBe(false);
      });
    });

    describe('contactInfoRequired', () => {
      it('returns false if skipPhoneEmailRules is true', async () => {
        await wrapper.setProps({ skipPhoneEmailRules: true });
        expect(wrapper.vm.contactInfoRequired).toEqual(false);
      });

      it('returns the right value if missingContactInfo is true and is submitting', async () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return true;
            },
          },
        });
        await wrapper.setProps({ skipPhoneEmailRules: false });
        await wrapper.setData({ submitting: true });
        expect(wrapper.vm.contactInfoRequired).toEqual({ isMissing: true });
      });

      it('returns the right value if focusPhoneCounter is bigger than triggerPhoneMessage', async () => {
        await wrapper.setProps({ skipPhoneEmailRules: false });
        await wrapper.setData({ focusPhoneCounter: 4, triggerPhoneMessage: 3 });
        expect(wrapper.vm.contactInfoRequired).toEqual({ isMissing: wrapper.vm.missingContactInfo });
      });

      it('returns false if focusPhoneCounter is smaller than triggerPhoneMessage and missingContactInfo is false', async () => {
        doMount(true, {
          computed: {
            missingContactInfo() {
              return false;
            },
          },
        });
        await wrapper.setProps({ skipPhoneEmailRules: false });
        await wrapper.setData({ focusPhoneCounter: 3, triggerPhoneMessage: 4 });
        expect(wrapper.vm.contactInfoRequired).toEqual(false);
      });
    });

    describe('missingContactInfo', () => {
      it('should return true if no phone and no email has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.email = '';
        wrapper.vm.formCopy.mobilePhoneNumber.number = '';
        wrapper.vm.formCopy.homePhoneNumber.number = '';
        wrapper.vm.formCopy.alternatePhoneNumber.number = '';

        expect(wrapper.vm.missingContactInfo).toBeTruthy();
      });

      it('should return false if a phone has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.mobilePhoneNumber.number = '12345';
        wrapper.vm.formCopy.email = '';
        expect(wrapper.vm.missingContactInfo).toBeFalsy();
      });

      it('should return false if a email has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.email = 'test@test.ca';
        expect(wrapper.vm.missingContactInfo).toBeFalsy();
      });

      it('should return false if skipPhoneEmailRules is true', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: true,
        });
        wrapper.vm.formCopy.email = 'test@test.ca';
        expect(wrapper.vm.missingContactInfo).toBeFalsy();
      });
    });
  });

  describe('Template', () => {
    describe('Life cycle hooks', () => {
      test('data are pre populated in the created method', async () => {
        wrapper.vm.prePopulate = jest.fn();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.prePopulate).toHaveBeenCalledTimes(1);
      });

      test('events are attached and detached', async () => {
        EventHub.$on = jest.fn();
        EventHub.$off = jest.fn();
        jest.clearAllMocks();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(EventHub.$on).toHaveBeenCalledWith('checkEmailValidation', wrapper.vm.validateForm);
        expect(EventHub.$on).toHaveBeenCalledWith('resetEmailValidation', wrapper.vm.resetEmailValidation);
        jest.clearAllMocks();
        wrapper.vm.$options.destroyed.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(EventHub.$off).toHaveBeenCalledWith('checkEmailValidation', wrapper.vm.validateForm);
        expect(EventHub.$off).toHaveBeenCalledWith('resetEmailValidation', wrapper.vm.resetEmailValidation);
      });
    });
  });

  describe('Validation rules', () => {
    describe('Preferred language', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__preferredLanguage');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.preferredLanguage);
      });
    });

    describe('Preferred language other', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.$set(wrapper.vm.formCopy, 'preferredLanguage', {
          isOther: true,
        });

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__preferredLanguageOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.preferredLanguageOther);
      });
    });

    describe('Primary spoken language other', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.$set(wrapper.vm.formCopy, 'primarySpokenLanguage', {
          isOther: true,
        });

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__primarySpokenLanguageOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.primarySpokenLanguageOther);
      });
    });

    describe('Home phone', () => {
      it('is linked to proper rules', () => {
        doMount(false);
        const element = wrapper.findDataTest('personalInfo__homePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.homePhoneNumber);
      });
    });

    describe('Mobile phone', () => {
      it('is linked to proper rules', () => {
        doMount(false);
        const element = wrapper.findDataTest('personalInfo__mobilePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.mobilePhoneNumber);
      });
    });

    describe('Other phone', () => {
      it('is linked to proper rules', () => {
        doMount(false);
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.alternatePhoneNumber);
      });
    });

    describe('Other phone extension', () => {
      it('is linked to proper rules', () => {
        doMount(false);
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumberExtension');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.alternatePhoneNumberExtension);
      });
    });

    describe('Email', () => {
      it('is linked to proper rules', () => {
        doMount(false);
        const element = wrapper.findDataTest('personalInfo__email');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.email);
      });
    });
  });

  describe('Methods', () => {
    describe('prePopulate', () => {
      it('should assign default value for preferredLanguage', () => {
        wrapper.vm.formCopy.preferredLanguage = null;
        const expected = wrapper.vm.preferredLanguagesItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.formCopy.preferredLanguage).toEqual(expected);
      });

      it('should assign default value for primarySpokenLanguage', () => {
        wrapper.vm.formCopy.primarySpokenLanguage = null;
        const expected = wrapper.vm.primarySpokenLanguagesItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.formCopy.primarySpokenLanguage).toEqual(expected);
      });
    });

    describe('findDefault', () => {
      it('should return the default option of the list', () => {
        const expected = wrapper.vm.primarySpokenLanguagesItems.find((option) => option.isDefault);
        const res = wrapper.vm.findDefault(wrapper.vm.primarySpokenLanguagesItems);
        expect(res).toEqual(expected);
      });
    });

    describe('onFocusOut', () => {
      it('should increment focusPhoneCounter', () => {
        expect(wrapper.vm.focusPhoneCounter).toEqual(0);
        wrapper.vm.onFocusOut();
        expect(wrapper.vm.focusPhoneCounter).toEqual(1);
      });

      it('should be called when focusing out homePhoneNumber', () => {
        doMount(false);
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__homePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.onFocusOut).toBeCalledTimes(1);
      });

      it('should be called when focusing out mobilePhoneNumber', () => {
        doMount(false);
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__mobilePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.onFocusOut).toBeCalledTimes(1);
      });

      it('should be called when focusing out alternatePhoneNumber', () => {
        doMount(false);
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.onFocusOut).toBeCalledTimes(1);
      });

      it('should be called when focusing out email', () => {
        doMount(false);
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__email');
        element.vm.$emit('focusout');
        expect(wrapper.vm.onFocusOut).toBeCalledTimes(1);
      });
    });

    describe('validateEmailOnBlur', () => {
      it('calls the timeout helper', async () => {
        helpers.timeout = jest.fn();
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(helpers.timeout).toHaveBeenCalledTimes(1);
      });

      it('emits fetchPublicToken if submitting is false and public registration mode and calls validateEmail after public token fetched', async () => {
        let emitted = false;
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        EventHub.$emit = jest.fn((p1, p2) => {
          emitted = p1 === 'fetchPublicToken'; p2();
        });
        wrapper.vm.validateEmail = jest.fn();
        await wrapper.setData({ submitting: true });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(EventHub.$emit).not.toHaveBeenCalled();
        expect(wrapper.vm.validateEmail).not.toHaveBeenCalled();
        await wrapper.setData({ submitting: false });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(EventHub.$emit).toHaveBeenCalledTimes(1);
        expect(emitted).toBeTruthy();
        expect(wrapper.vm.validateEmail).toHaveBeenCalledWith('mock-email');
      });

      it('does not emits fetchPublicToken if submitting is false and crc registration mode and calls validateEmail right away', async () => {
        let emitted = false;
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        EventHub.$emit = jest.fn((p1, p2) => {
          emitted = p1 === 'fetchPublicToken'; p2();
        });
        wrapper.vm.validateEmail = jest.fn();
        await wrapper.setData({ submitting: true });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(EventHub.$emit).not.toHaveBeenCalled();
        expect(wrapper.vm.validateEmail).not.toHaveBeenCalled();
        await wrapper.setData({ submitting: false });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(EventHub.$emit).toHaveBeenCalledTimes(0);
        expect(emitted).toBeFalsy();
        expect(wrapper.vm.validateEmail).toHaveBeenCalledWith('mock-email');
      });

      it('should be triggered when blurring email field if for CRC (no recaptcha key)', () => {
        doMount(false);
        wrapper.vm.validateEmailOnBlur = jest.fn();
        const element = wrapper.findDataTest('personalInfo__email');
        element.vm.$emit('blur', { target: { value: 'email' } });

        expect(wrapper.vm.validateEmailOnBlur).toHaveBeenLastCalledWith('email');
      });
    });

    describe('validateForm', () => {
      it('calls the passed function if email was validated  by backend, no fetchtoken', async () => {
        await wrapper.setData({ formCopy: { ...wrapper.vm.formCopy, emailValidatedByBackend: true } });
        let emitted = false;
        EventHub.$emit = jest.fn((p1, p2) => {
          emitted = p1 === 'fetchPublicToken'; p2();
        });
        const mockFn = jest.fn(() => false);
        await wrapper.vm.validateForm(mockFn);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(emitted).toBeFalsy();
      });

      it('asks to fetchPublicToken if public registration', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        await wrapper.setData({ formCopy: { ...wrapper.vm.formCopy, emailValidatedByBackend: false } });
        let emitted = false;
        EventHub.$emit = jest.fn((p1, p2) => {
          emitted = p1 === 'fetchPublicToken'; p2();
        });
        const mockFn = jest.fn(() => false);
        await wrapper.vm.validateForm(mockFn);
        expect(emitted).toBeTruthy();
        expect(mockFn).toHaveBeenCalled();
      });

      it('does not ask to fetchPublicToken if crc registration', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        await wrapper.setData({ formCopy: { ...wrapper.vm.formCopy, emailValidatedByBackend: false } });
        let emitted = false;
        EventHub.$emit = jest.fn((p1, p2) => {
          emitted = p1 === 'fetchPublicToken'; p2();
        });
        const mockFn = jest.fn(() => false);
        await wrapper.vm.validateForm(mockFn);
        expect(emitted).toBeFalsy();
        expect(mockFn).toHaveBeenCalled();
      });
    });

    describe('validateEmail', () => {
      beforeEach(() => {
        wrapper.vm.$refs = {
          email: {
            validate: jest.fn(),
          },
        };
        wrapper.vm.setEmailValidator = jest.fn();
      });

      it('should call resetEmailValidation and not execute method if no email', async () => {
        wrapper.vm.resetEmailValidation = jest.fn();
        await wrapper.setData({ formCopy: { ...wrapper.vm.formCopy, email: '' } });
        await wrapper.vm.validateEmail('');
        expect(wrapper.vm.resetEmailValidation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$services.households.validateEmail).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$services.households.validatePublicEmail).toHaveBeenCalledTimes(0);
      });

      it('should do nothing if new email is the same as previous one', async () => {
        await wrapper.setData({ previousEmail: 'test@test.ca' });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$services.households.validateEmail).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$services.households.validatePublicEmail).toHaveBeenCalledTimes(0);
      });

      it('should disregard duplicate errors if allowDuplicateEmails', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        wrapper.vm.$services.households.validatePublicEmail = jest.fn(() => ({
          emailIsValid: false, errors: [{ code: 'hello' }, { code: 'errors.the-email-provided-already-exists-in-the-system' }],
        }));
        wrapper.vm.setEmailValidator = jest.fn();
        await wrapper.setProps({ allowDuplicateEmails: false });
        await wrapper.setData({ previousEmail: '' });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledWith({
          emailIsValid: false, errors: [{ code: 'hello' }, { code: 'errors.the-email-provided-already-exists-in-the-system' }],
        });

        await wrapper.setProps({ allowDuplicateEmails: true });
        jest.clearAllMocks();
        await wrapper.setData({ previousEmail: '' });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledWith({
          emailIsValid: false, errors: [{ code: 'hello' }],
        });

        wrapper.vm.$services.households.validatePublicEmail = jest.fn(() => ({
          emailIsValid: false, errors: [{ code: 'errors.the-email-provided-already-exists-in-the-system' }],
        }));
        await wrapper.setProps({ allowDuplicateEmails: true });
        jest.clearAllMocks();
        await wrapper.setData({ previousEmail: '' });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toBeCalledWith({
          emailIsValid: true, errors: [],
        });
      });

      it('should set emailValidatedByBackend', async () => {
        await wrapper.setData({
          formCopy: {
            emailValidatedByBackend: false,
          },
        });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.formCopy.emailValidatedByBackend).toBe(true);
      });

      describe('CRC Registration', () => {
        it('should trigger validate email with proper params', async () => {
          wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
          await wrapper.vm.validateEmail('test@test.ca');

          expect(wrapper.vm.$services.households.validateEmail).toHaveBeenCalledWith({
            emailAddress: 'test@test.ca',
            personId: 'personId',
          });
          expect(wrapper.vm.formCopy.emailValidatedByBackend).toBe(true);
        });
      });

      describe('Self Registration', () => {
        it('should trigger validatePublicEmail with proper params', async () => {
          wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
          await wrapper.vm.validateEmail('test@test.ca');

          expect(wrapper.vm.$services.households.validatePublicEmail).toHaveBeenCalledWith({
            emailAddress: 'test@test.ca',
            personId: 'personId',
          });
          expect(wrapper.vm.formCopy.emailValidatedByBackend).toBe(true);
        });
      });

      it('should call setEmailValidator method', async () => {
        const result = {
          emailIsValid: true,
          errors: [],
        };

        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledWith(result);
      });
    });

    describe('setEmailValidator', () => {
      it('should set isValid', () => {
        wrapper.vm.$registrationStore.getEvent = jest.fn(() => mockEvent());
        const result = {
          emailIsValid: false,
          errors: [{ code: 'errorCode' }],
        };
        wrapper.vm.setEmailValidator(result);

        expect(wrapper.vm.emailValidator.isValid).toBe(false);
      });

      it('should set custom messageKey if email already exists', () => {
        const result = {
          emailIsValid: false,
          errors: [{ code: 'errors.the-email-provided-already-exists-in-the-system' }],
        };

        wrapper.vm.setEmailValidator(result);

        expect(wrapper.vm.emailValidator.messageKey).toBe(wrapper.vm.emailAlreadyExistMessage);
      });

      it('should set messageKey otherwise', () => {
        const result = {
          emailIsValid: false,
          errors: [{ code: 'errorCode' }],
        };
        wrapper.vm.setEmailValidator(result);

        expect(wrapper.vm.emailValidator.messageKey).toBe('errorCode');
      });
    });

    describe('resetEmailValidation', () => {
      it('resets the value of emailValidator and emailValidatedByBackend', async () => {
        wrapper.setData({
          emailValidator: {
            isValid: false,
            messageKey: 'mock key',
          },
          formCopy: {
            emailValidatedByBackend: false,
          },
        });

        await wrapper.vm.resetEmailValidation();

        expect(wrapper.vm.emailValidator).toEqual({
          isValid: true,
          messageKey: null,
        });

        expect(wrapper.vm.formCopy.emailValidatedByBackend).toBeFalsy();
      });
    });
  });
});
