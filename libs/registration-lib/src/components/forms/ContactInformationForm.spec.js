import {
  mockContactInformation,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../entities/household-create';
import { MAX_LENGTH_MD } from '../../constants/validations';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './ContactInformationForm.vue';
import helpers from '../../ui/helpers';

const localVue = createLocalVue();

describe('ContactInformationForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: mockContactInformation(),
        preferredLanguagesItems: mockPreferredLanguages(),
        primarySpokenLanguagesItems: mockPrimarySpokenLanguages(),
        personId: 'personId',
      },
      stubs: {
        'vue-programmatic-invisible-google-recaptcha': { template: '<div></div>' },
      },
    });

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
        expect(wrapper.vm.rules.homePhoneNumber).toEqual(wrapper.vm.phoneRule);
      });

      test('mobilePhoneNumber', () => {
        expect(wrapper.vm.rules.mobilePhoneNumber).toEqual(wrapper.vm.phoneRule);
      });

      test('alternatePhoneNumber', () => {
        expect(wrapper.vm.rules.alternatePhoneNumber).toEqual(wrapper.vm.phoneRule);
      });

      test('alternatePhoneNumberExtension', () => {
        expect(wrapper.vm.rules.alternatePhoneNumberExtension).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('email', async () => {
        await wrapper.setData({
          emailValidator: {
            isValid: true,
            messageKey: 'messageKey',
          },
        });

        expect(wrapper.vm.rules.email).toEqual({
          required: wrapper.vm.emailRequired,
          customValidator: {
            isValid: true,
            messageKey: 'messageKey',
          },
        });
      });
    });

    describe('emailLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.emailAddress')}${wrapper.vm.hasAnyPhone ? '' : '*'}`;
        expect(wrapper.vm.emailLabel).toEqual(expected);
      });
    });

    describe('homePhoneNumberLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.homePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.homePhoneNumberLabel).toEqual(expected);
      });
    });

    describe('mobilePhoneNumberLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.mobilePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.mobilePhoneNumberLabel).toEqual(expected);
      });
    });

    describe('alternatePhoneNumberLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.alternatePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.alternatePhoneNumberLabel).toEqual(expected);
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

    describe('phoneRequired', () => {
      it('should return true if no phone and no email has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.email = '';
        wrapper.vm.formCopy.mobilePhoneNumber.number = '';
        wrapper.vm.formCopy.homePhoneNumber.number = '';
        wrapper.vm.formCopy.alternatePhoneNumber.number = '';

        expect(wrapper.vm.phoneRequired).toBeTruthy();
      });

      it('should return false if a phone has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.mobilePhoneNumber.number = '12345';
        wrapper.vm.formCopy.email = '';
        expect(wrapper.vm.phoneRequired).toBeFalsy();
      });

      it('should return false if a email has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.email = 'test@test.ca';
        expect(wrapper.vm.phoneRequired).toBeFalsy();
      });

      it('should return false if skipPhoneEmailRules is true', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: true,
        });
        wrapper.vm.formCopy.email = 'test@test.ca';
        expect(wrapper.vm.phoneRequired).toBeFalsy();
      });
    });

    describe('emailRequired', () => {
      it('should return false if phoneEmailRules is disabled', () => {
        expect(wrapper.vm.emailRequired).toBeFalsy();
      });

      it('should return result of !hasAnyPhone if skipPhoneEmailRules is false', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        expect(wrapper.vm.emailRequired).toEqual(!wrapper.vm.hasAnyPhone);
      });
    });

    describe('phoneRule', () => {
      it('should correct rule if skipPhoneEmailRules is false', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        expect(wrapper.vm.phoneRule).toEqual({
          requiredPhone: wrapper.vm.focusPhoneCounter >= wrapper.vm.triggerPhoneMessage ? { isMissing: this.phoneRequired } : false,
          phone: true,
        });
      });

      it('should correct rule if skipPhoneEmailRules is true', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: true,
        });
        expect(wrapper.vm.phoneRule).toEqual({
          phone: true,
        });
      });
    });

    describe('isCRCRegistration', () => {
      it('returns correct value', async () => {
        wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => true);
        expect(wrapper.vm.isCRCRegistration).toBe(true);

        wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => false);
        expect(wrapper.vm.isCRCRegistration).toBe(false);
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
        const element = wrapper.findDataTest('personalInfo__homePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.homePhoneNumber);
      });
    });

    describe('Mobile phone', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__mobilePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.mobilePhoneNumber);
      });
    });

    describe('Other phone', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumber');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.alternatePhoneNumber);
      });
    });

    describe('Other phone extension', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumberExtension');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.alternatePhoneNumberExtension);
      });
    });

    describe('Email', () => {
      it('is linked to proper rules', () => {
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

    describe('onFocustOut', () => {
      it('should increment focusPhoneCounter', () => {
        expect(wrapper.vm.focusPhoneCounter).toEqual(0);
        wrapper.vm.onFocusOut();
        expect(wrapper.vm.focusPhoneCounter).toEqual(1);
      });

      it('should be called when focusing out homePhoneNumber', () => {
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__homePhoneNumber');
        element.vm.$emit('focusout', null);
        expect(wrapper.vm.onFocusOut).toBeCalledWith('homePhoneNumber', null);
      });

      it('should be called when focusing out mobilePhoneNumber', () => {
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__mobilePhoneNumber');
        element.vm.$emit('focusout', null);
        expect(wrapper.vm.onFocusOut).toBeCalledWith('mobilePhoneNumber', null);
      });

      it('should be called when focusing out alternatePhoneNumber', () => {
        wrapper.vm.onFocusOut = jest.fn();
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumber');
        element.vm.$emit('focusout', null);
        expect(wrapper.vm.onFocusOut).toBeCalledWith('alternatePhoneNumber', null);
      });
    });

    describe('validateEmailOnBlur', () => {
      it('calls the timeout helper', async () => {
        helpers.timeout = jest.fn();
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(helpers.timeout).toHaveBeenCalledTimes(1);
      });

      it('calls validateEmail if submitting is false', async () => {
        wrapper.vm.validateEmail = jest.fn();
        await wrapper.setData({ submitting: true });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(wrapper.vm.validateEmail).toHaveBeenCalledTimes(0);
        await wrapper.setData({ submitting: false });
        await wrapper.vm.validateEmailOnBlur('mock-email');
        expect(wrapper.vm.validateEmail).toHaveBeenCalledWith('mock-email');
      });

      it('should be triggered when blurring email field if for CRC (no recaptcha key)', () => {
        wrapper.vm.validateEmailOnBlur = jest.fn();
        const element = wrapper.findDataTest('personalInfo__email');
        element.vm.$emit('blur', { target: { value: 'email' } });

        expect(wrapper.vm.validateEmailOnBlur).toHaveBeenLastCalledWith('email');
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
      });

      it('should do nothing if new email is the same as previous one', async () => {
        await wrapper.setData({ previousEmail: 'test@test.ca' });
        await wrapper.vm.validateEmail('test@test.ca');
        expect(wrapper.vm.setEmailValidator).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$services.households.validateEmail).toHaveBeenCalledTimes(0);
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
          wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => true);
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
          wrapper.vm.$storage.registration.getters.isCRCRegistration = jest.fn(() => false);
          await wrapper.vm.validateEmail('test@test.ca', 'token');

          expect(wrapper.vm.$services.households.validatePublicEmail).toHaveBeenCalledWith({
            emailAddress: 'test@test.ca',
            recaptchaToken: 'token',
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

    describe('recaptchaCallBack', () => {
      it('should call validateEmail with the email and the token', async () => {
        wrapper.vm.validateEmail = jest.fn();
        await wrapper.vm.recaptchaCallBack('token');
        expect(wrapper.vm.validateEmail).toHaveBeenCalledWith(wrapper.vm.formCopy.email, 'token');
      });
      it('should do nothing if no token (user will need to face a challenge)', async () => {
        wrapper.vm.validateEmail = jest.fn();
        await wrapper.vm.recaptchaCallBack('');
        expect(wrapper.vm.validateEmail).not.toHaveBeenCalledWith(wrapper.vm.formCopy.email, 'token');
      });
    });

    describe('getTokenAndValidate', () => {
      beforeEach(() => {
        wrapper.vm.$refs = {
          recaptchaEmail: {
            execute: jest.fn(),
          },
        };
      });

      it('should call resetEmailValidation and not execute method if no email', () => {
        wrapper.vm.resetEmailValidation = jest.fn();
        wrapper.vm.getTokenAndValidate('');
        expect(wrapper.vm.resetEmailValidation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$refs.recaptchaEmail.execute).toHaveBeenCalledTimes(0);
      });

      it('should call execute method from recaptcha', () => {
        wrapper.vm.getTokenAndValidate('test@test.ca');
        expect(wrapper.vm.$refs.recaptchaEmail.execute).toHaveBeenCalledTimes(1);
      });

      it('should be triggered when blurring email field if for Registration (with recaptcha key)', async () => {
        await wrapper.setProps({
          recaptchaKey: '12345',
        });
        wrapper.vm.getTokenAndValidate = jest.fn();
        const element = wrapper.findDataTest('personalInfo__email');
        element.vm.$emit('blur', { target: { value: 'email' } });

        expect(wrapper.vm.getTokenAndValidate).toHaveBeenLastCalledWith('email');
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

        expect(wrapper.vm.formCopy.emailValidatedByBackend).toBeTruthy();
      });
    });
  });
});
