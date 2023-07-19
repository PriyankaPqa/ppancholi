import {
  MemberDuplicateStatus,
  mockGenders,
  mockIdentitySet,
} from '@libs/entities-lib/src/household-create';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './IdentityForm.vue';

const mockIdentitySetModified = mockIdentitySet();
mockIdentitySetModified.birthDate.year = '1999';
mockIdentitySetModified.birthDate.day = '12';
mockIdentitySetModified.birthDate.month = '2';

const localVue = createLocalVue();

describe('IdentityForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: mockIdentitySetModified,
        genderItems: mockGenders(),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    test('change event is emitted when form changes', async () => {
      wrapper.vm.formCopy.firstName = 'test';
      expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.formCopy]);
    });

    test('displays the error if there is a duplicate if feature flag is on', async () => {
      const identitySet = mockIdentitySet();
      identitySet.getMemberDuplicateStatus = jest.fn(() => MemberDuplicateStatus.Duplicate);
      wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
      await wrapper.setProps({ form: identitySet });
      const element = wrapper.findDataTest('personal_info_duplicate_error');
      expect(element.exists()).toBeTruthy();
    });

    test('does not display the error if there is no duplicate', async () => {
      const identitySet = mockIdentitySet();
      identitySet.isDuplicate = jest.fn(() => false);
      await wrapper.setProps({ form: identitySet });
      const element = wrapper.findDataTest('personal_info_duplicate_error');
      expect(element.exists()).toBeFalsy();
    });

    describe('personalInfo__firstName', () => {
      it('should ', async () => {
        wrapper.vm.capitalize = jest.fn();
        const element = wrapper.findDataTest('personalInfo__firstName');
        await element.vm.$emit('input');
        expect(wrapper.vm.capitalize).toHaveBeenCalledWith('firstName');
      });
    });

    describe('personalInfo__lastName', () => {
      it('should ', async () => {
        wrapper.vm.capitalize = jest.fn();
        const element = wrapper.findDataTest('personalInfo__lastName');
        await element.vm.$emit('input');
        expect(wrapper.vm.capitalize).toHaveBeenCalledWith('lastName');
      });
    });

    describe('personalInfo__preferredName', () => {
      it('should ', async () => {
        wrapper.vm.capitalize = jest.fn();
        const element = wrapper.findDataTest('personalInfo__preferredName');
        await element.vm.$emit('input');
        expect(wrapper.vm.capitalize).toHaveBeenCalledWith('preferredName');
      });
    });

    describe('personalInfo__middleName', () => {
      it('should ', async () => {
        wrapper.vm.capitalize = jest.fn();
        const element = wrapper.findDataTest('personalInfo__middleName');
        await element.vm.$emit('input');
        expect(wrapper.vm.capitalize).toHaveBeenCalledWith('middleName');
      });
    });
  });

  describe('Computed', () => {
    describe('computedBirthdate', () => {
      it('returns an birthdate object', () => {
        const res = wrapper.vm.computedBirthdate;
        expect(res).toEqual({
          year: '1999',
          month: '2',
          day: '12',
        });
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
          required: true,
        });
      });

      test('month', () => {
        expect(wrapper.vm.rules.month).toEqual(wrapper.vm.birthDateRule);
      });

      test('day', () => {
        expect(wrapper.vm.rules.day).toEqual(wrapper.vm.birthDateRule);
      });

      test('year', () => {
        expect(wrapper.vm.rules.year).toEqual(wrapper.vm.birthDateRule);
      });
    });

    describe('birthdateRule', () => {
      it('should return proper data if age restriction is enable', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            form: mockIdentitySetModified,
            minAgeRestriction: 15,
            genderItems: mockGenders(),
          },
        });
        expect(wrapper.vm.birthDateRule).toEqual({
          required: true,
          birthday: wrapper.vm.fullDate ? { birthdate: wrapper.vm.computedBirthdate } : false,
          minimumAge: wrapper.vm.fullDate ? { birthdate: wrapper.vm.computedBirthdate, age: wrapper.vm.minAgeRestriction } : false,
        });
      });

      it('should return proper data if age restriction is disabled', () => {
        expect(wrapper.vm.birthDateRule).toEqual({
          required: true,
          birthday: wrapper.vm.fullDate ? { birthdate: wrapper.vm.computedBirthdate } : false,
        });
      });
    });

    describe('fullDate', () => {
      it('should return false if only day is not empty', async () => {
        await wrapper.setData({
          formCopy: {
            birthDate: {
              day: '12',
              month: '',
              year: '',
            },
          },
        });
        expect(wrapper.vm.fullDate).toBe(false);
      });

      it('should return false if only month is not empty', async () => {
        await wrapper.setData({
          formCopy: {
            birthDate: {
              day: '',
              month: '01',
              year: '',
            },
          },
        });
        expect(wrapper.vm.fullDate).toBe(false);
      });

      it('should return false if only year is not empty', async () => {
        await wrapper.setData({
          formCopy: {
            birthDate: {
              day: '',
              month: '',
              year: '01',
            },
          },
        });
        expect(wrapper.vm.fullDate).toBe(false);
      });

      it('should return true if all components are not empty', async () => {
        await wrapper.setData({
          formCopy: {
            birthDate: {
              day: '01',
              month: '01',
              year: '01',
            },
          },
        });
        expect(wrapper.vm.fullDate).toBe(true);
      });
    });
  });

  describe('Methods', () => {
    describe('prePopulate', () => {
      it('should assign default value for gender', () => {
        wrapper.vm.formCopy.gender = null;
        const defaultGender = wrapper.vm.genderItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.formCopy.gender).toEqual(defaultGender);
      });
    });

    describe('capitalize', () => {
      it('should update data properly when feature flag AutoCapitalizationForRegistration is on', () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [FeatureKeys.AutoCapitalizationForRegistration],
          propsData: {
            form: mockIdentitySet({
              firstName: 'goodman',
            }),
            genderItems: mockGenders(),
          },
          data() {
            return {
              formCopy: {
                firstName: 'goodman',
              },
            };
          },
        });

        wrapper.vm.capitalize('firstName');
        expect(wrapper.vm.formCopy.firstName).toEqual('Goodman');
      });

      it('will not update data properly when feature flag AutoCapitalizationForRegistration is off', () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [],
          propsData: {
            form: mockIdentitySet({
              firstName: 'goodman',
            }),
            genderItems: mockGenders(),
          },
          data() {
            return {
              formCopy: {
                firstName: 'goodman',
              },
            };
          },
        });

        wrapper.vm.capitalize('firstName');
        expect(wrapper.vm.formCopy.firstName).toEqual('goodman');
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: mockIdentitySetModified,
          genderItems: mockGenders(),
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
        wrapper.vm.$set(wrapper.vm.formCopy, 'gender', {
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
  });

  describe('Life cycle hooks', () => {
    test('data are pre populated in the created method', async () => {
      wrapper.vm.prePopulate = jest.fn();
      wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.prePopulate).toHaveBeenCalledTimes(1);
    });

    test('form includes honeypot field', async () => {
      wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(Object.keys(wrapper.vm.formCopy).indexOf('name')).toBeGreaterThan(-1);
      expect(wrapper.vm.formCopy.name).toBeFalsy();
    });
  });
});
