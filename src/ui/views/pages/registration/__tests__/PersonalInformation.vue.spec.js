import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockPersonalInformation,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '@/entities/beneficiary';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import Component from '../PersonalInformation.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PersonalInformation.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      computed: {
        personalInformation() {
          return mockPersonalInformation();
        },
      },
    });
  });

  describe('Computed', () => {
    describe('hasHomePhoneAndEmail', () => {
      it('returns true if either email or home phone number is provided', async () => {
        wrapper.vm.$set(wrapper.vm.form, 'email', '');

        wrapper.vm.$set(wrapper.vm.form, 'homePhone', {
          countryISO2: 'CA',
          number: 123,
          e164Number: 123,
        });

        expect(wrapper.vm.hasHomePhoneAndEmail).toBeTruthy();
        wrapper.vm.$set(wrapper.vm.form, 'homePhone', null);
        expect(wrapper.vm.hasHomePhoneAndEmail).toBeFalsy();
      });
    });

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
        expect(wrapper.vm.rules.homePhone).toEqual({
          hasPhoneOrEmail: { hasPhoneOrEmail: wrapper.vm.hasHomePhoneAndEmail },
          phone: true,
        });
      });

      test('mobilePhone', () => {
        expect(wrapper.vm.rules.mobilePhone).toEqual({
          phone: true,
        });
      });

      test('otherPhone', () => {
        expect(wrapper.vm.rules.otherPhone).toEqual({
          phone: true,
        });
      });

      test('otherPhoneExtension', () => {
        expect(wrapper.vm.rules.otherPhoneExtension).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('email', () => {
        expect(wrapper.vm.rules.email).toEqual({
          hasPhoneOrEmail: { hasPhoneOrEmail: wrapper.vm.hasHomePhoneAndEmail },
          email: true,
          max: MAX_LENGTH_MD,
        });
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      test('setPersonalInformation is called when form change', async () => {
        wrapper.vm.form.firstName = 'test';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$storage.beneficiary.mutations.setPersonalInformation).toHaveBeenCalledWith(wrapper.vm.form);
      });
    });

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
        wrapper.vm.$set(wrapper.vm.form, 'preferredLanguage', {
          isOther: true,
        });

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__preferredLanguageOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.preferredLanguageOther);
      });
    });

    describe('Primary spoken language other', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.$set(wrapper.vm.form, 'primarySpokenLanguage', {
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
        wrapper.vm.form.preferredLanguage = null;
        const expected = wrapper.vm.preferredLanguagesItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.form.preferredLanguage).toEqual(expected);
      });

      it('should assign default value for primarySpokenLanguage', () => {
        wrapper.vm.form.primarySpokenLanguage = null;
        const expected = wrapper.vm.primarySpokenLanguagesItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.form.primarySpokenLanguage).toEqual(expected);
      });
    });

    describe('findDefault', () => {
      it('should return the default option of the list', () => {
        const expected = wrapper.vm.primarySpokenLanguagesItems.find((option) => option.isDefault);
        const res = wrapper.vm.findDefault(wrapper.vm.primarySpokenLanguagesItems);
        expect(res).toEqual(expected);
      });
    });
  });
});
