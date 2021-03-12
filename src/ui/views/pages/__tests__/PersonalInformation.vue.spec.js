import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  Beneficiary,
  mockGenders,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockIndigenousTypesItems,
  mockIndigenousCommunitiesItems,
} from '@/entities/beneficiary';
import { ECanadaProvinces } from '@/types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM, MIN_AGE_REGISTRATION } from '@/constants/validations';
import utils from '@/entities/utils';
import { mockStorage } from '@/store/storage';
import Component from '../PersonalInformation.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PersonalInformation.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        mocks: {
          $storage: storage,
        },
        computed: {
          loadingIndigenousIdentities() { return false; },
        },
      });
    });

    describe('hasHomePhoneAndEmail', () => {
      it('returns true if either email or home phone number is provided', async () => {
        wrapper.vm.$set(wrapper.vm.form, 'homePhone', {
          countryISO2: 'CA',
          number: 123,
          e164Number: 123,
        });
        expect(wrapper.vm.hasHomePhoneAndEmail).toBeTruthy();

        wrapper.vm.form.homePhone.number = null;
        expect(wrapper.vm.hasHomePhoneAndEmail).toBeFalsy();
      });
    });

    describe('gendersItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.gendersItems).toEqual(mockGenders());
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

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('mockIndigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('rules', () => {
      test('firstName', () => {
        expect(wrapper.vm.rules.firstName).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('middleName', () => {
        expect(wrapper.vm.rules.middleName).toEqual({
          max: MAX_LENGTH_SM,
        });
      });

      test('lastName', () => {
        expect(wrapper.vm.rules.lastName).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('preferredName', () => {
        expect(wrapper.vm.rules.preferredName).toEqual({
          max: MAX_LENGTH_SM,
        });
      });

      test('gender', () => {
        expect(wrapper.vm.rules.gender).toEqual({
          required: true,
        });
      });

      test('genderOther', () => {
        expect(wrapper.vm.rules.genderOther).toEqual({
          max: MAX_LENGTH_MD,
        });
      });

      test('month', () => {
        expect(wrapper.vm.rules.month).toEqual({
          required: true,
          birthday: { birthdate: wrapper.vm.computedBirthdate },
          minimumAge: { birthdate: wrapper.vm.computedBirthdate, age: MIN_AGE_REGISTRATION },
        });
      });

      test('day', () => {
        expect(wrapper.vm.rules.day).toEqual({
          required: true,
          birthday: { birthdate: wrapper.vm.computedBirthdate },
          minimumAge: { birthdate: wrapper.vm.computedBirthdate, age: MIN_AGE_REGISTRATION },
        });
      });

      test('year', () => {
        expect(wrapper.vm.rules.year).toEqual({
          required: true,
          birthday: { birthdate: wrapper.vm.computedBirthdate },
          minimumAge: { birthdate: wrapper.vm.computedBirthdate, age: MIN_AGE_REGISTRATION },
        });
      });

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

      test('indigenousType', () => {
        expect(wrapper.vm.rules.indigenousType).toEqual({
          required: wrapper.vm.form.indigenousProvince !== null,
        });
      });

      test('indigenousCommunityId', () => {
        expect(wrapper.vm.rules.indigenousCommunityId).toEqual({
          required: wrapper.vm.form.indigenousType !== null,
        });
      });

      test('indigenousCommunityOther', () => {
        expect(wrapper.vm.rules.indigenousCommunityOther).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        computed: {
          loadingIndigenousIdentities() { return false; },
        },
      });
    });

    describe('Event handlers', () => {
      test('event is emitted when form change', async () => {
        wrapper.vm.form.firstName = 'test';
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('updateEntity')).toBeTruthy();
      });
    });

    describe('Life cycle hooks', () => {
      test('data are pre populated in the created method', async () => {
        wrapper.vm.prepopulate = jest.fn();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.prepopulate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        computed: {
          loadingIndigenousIdentities() { return false; },
        },
      });
    });

    describe('First name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__firstName');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.firstName);
      });
    });

    describe('Middle name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__middleName');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.middleName);
      });
    });

    describe('Last name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__lastName');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.lastName);
      });
    });

    describe('Preferred name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__preferredName');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.preferredName);
      });
    });

    describe('Gender', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__gender');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.gender);
      });
    });

    describe('Gender other', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.$set(wrapper.vm.form, 'gender', {
          isOther: true,
        });

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__genderOther');

        expect(element.props('rules')).toEqual(wrapper.vm.rules.genderOther);
      });
    });

    describe('Month', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__month');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.month);
      });
    });

    describe('Day', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__day');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.day);
      });
    });

    describe('Year', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__year');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.year);
      });
    });

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

    describe('indigenousType', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__indigenousType');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousType);
      });
    });

    describe('indigenousCommunityId', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__indigenousCommunityId');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityId);
      });
    });

    describe('indigenousCommunityOther', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.form.indigenousType = 'Other';

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__indigenousCommunityOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityOther);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        computed: {
          loadingIndigenousIdentities() { return false; },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('onIndigenousProvinceChange', () => {
      it('dispatches the action to fetch indigenous identities by province', async () => {
        wrapper.vm.onIndigenousProvinceChange('ON');
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledTimes(1);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
    });
  });
});
