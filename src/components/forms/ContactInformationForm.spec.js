import {
  mockContactInformation,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../entities/household-create';
import { MAX_LENGTH_MD } from '../../constants/validations';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './ContactInformationForm.vue';

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
      },
    });
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
          customValidator: {
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

      it('calls backend to validate', async () => {
        wrapper.vm.$services.households.validateEmail = jest.fn(() => ({ emailIsValid: true }));

        await wrapper.setData({
          formCopy: {
            email: 'email',
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(wrapper.vm.$services.households.validateEmail).toHaveBeenCalledWith({ emailAddress: 'email', personId: null });
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

    describe('incrementFocusPhoneCounter', () => {
      it('should increment focusPhoneCounter', () => {
        expect(wrapper.vm.focusPhoneCounter).toEqual(0);
        wrapper.vm.incrementFocusPhoneCounter();
        expect(wrapper.vm.focusPhoneCounter).toEqual(1);
      });

      it('should be called when focusing out homePhoneNumber', () => {
        wrapper.vm.incrementFocusPhoneCounter = jest.fn();
        const element = wrapper.findDataTest('personalInfo__homePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.incrementFocusPhoneCounter).toBeCalledTimes(1);
      });

      it('should be called when focusing out mobilePhoneNumber', () => {
        wrapper.vm.incrementFocusPhoneCounter = jest.fn();
        const element = wrapper.findDataTest('personalInfo__mobilePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.incrementFocusPhoneCounter).toBeCalledTimes(1);
      });

      it('should be called when focusing out alternatePhoneNumber', () => {
        wrapper.vm.incrementFocusPhoneCounter = jest.fn();
        const element = wrapper.findDataTest('personalInfo__alternatePhoneNumber');
        element.vm.$emit('focusout');
        expect(wrapper.vm.incrementFocusPhoneCounter).toBeCalledTimes(1);
      });
    });
  });
});
