import {
  mockContactInformation,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockPrimarySpokenLanguage,
} from '../../entities/beneficiary';
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

      test('primarySpokenLanguageOther', () => {
        expect(wrapper.vm.rules.primarySpokenLanguageOther).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('homePhone', () => {
        expect(wrapper.vm.rules.homePhone).toEqual(wrapper.vm.phoneRule);
      });

      test('mobilePhone', () => {
        expect(wrapper.vm.rules.mobilePhone).toEqual(wrapper.vm.phoneRule);
      });

      test('otherPhone', () => {
        expect(wrapper.vm.rules.otherPhone).toEqual(wrapper.vm.phoneRule);
      });

      test('otherPhoneExtension', () => {
        expect(wrapper.vm.rules.otherPhoneExtension).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('email', () => {
        expect(wrapper.vm.rules.email).toEqual({
          required: wrapper.vm.emailRequired,
          email: true,
          max: MAX_LENGTH_MD,
        });
      });
    });

    describe('emailLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.emailAddress')}${wrapper.vm.hasAnyPhone ? '' : '*'}`;
        expect(wrapper.vm.emailLabel).toEqual(expected);
      });
    });

    describe('homePhoneLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.homePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.homePhoneLabel).toEqual(expected);
      });
    });

    describe('mobilePhoneLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.mobilePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.mobilePhoneLabel).toEqual(expected);
      });
    });

    describe('otherPhoneLabel', () => {
      it('should return proper string', () => {
        const expected = `${wrapper.vm.$t('registration.personal_info.alternatePhoneNumber')}${wrapper.vm.phoneRequired ? '*' : ''}`;
        expect(wrapper.vm.otherPhoneLabel).toEqual(expected);
      });
    });

    describe('hasAnyPhone', () => {
      it('should return true if homePhone is not empty', () => {
        wrapper.vm.formCopy.homePhone.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });

      it('should return true if mobilePhone is not empty', () => {
        wrapper.vm.formCopy.mobilePhone.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });

      it('should return true if otherPhone is not empty', () => {
        wrapper.vm.formCopy.otherPhone.number = '12345';
        expect(wrapper.vm.hasAnyPhone).toBeTruthy();
      });
    });

    describe('phoneRequired', () => {
      it('should return true if no phone and no email has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.email = '';
        wrapper.vm.formCopy.mobilePhone.number = '';
        wrapper.vm.formCopy.homePhone.number = '';
        wrapper.vm.formCopy.otherPhone.number = '';

        expect(wrapper.vm.phoneRequired).toBeTruthy();
      });

      it('should return false if a phone has been inputted', async () => {
        await wrapper.setProps({
          skipPhoneEmailRules: false,
        });
        wrapper.vm.formCopy.mobilePhone.number = '12345';
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
          requiredPhone: { isMissing: wrapper.vm.phoneRequired },
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
        const element = wrapper.findDataTest('personalInfo__homePhone');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.homePhone);
      });
    });

    describe('Mobile phone', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__mobilePhone');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.mobilePhone);
      });
    });

    describe('Other phone', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__otherPhone');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.otherPhone);
      });
    });

    describe('Other phone extension', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__otherPhoneExtension');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.otherPhoneExtension);
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

    describe('primarySpokenLanguageChange', () => {
      it('should erase primarySpokenLanguageOther if the language is not other', async () => {
        await wrapper.setData({
          form: {
            primarySpokenLanguageOther: 'test',
          },
        });
        wrapper.vm.primarySpokenLanguageChange(mockPrimarySpokenLanguage());
        expect(wrapper.vm.formCopy.primarySpokenLanguageOther).toBe('');
      });

      it('should be called when primary spoken language changes', () => {
        jest.spyOn(wrapper.vm, 'primarySpokenLanguageChange');
        const el = wrapper.findDataTest('personalInfo__primarySpokenLanguage');
        el.vm.$emit('change', mockPrimarySpokenLanguage());
        expect(wrapper.vm.primarySpokenLanguageChange).toHaveBeenCalledTimes(1);
      });
    });
  });
});
