import { createLocalVue, shallowMount } from '@/test/testSetup';

import {
  mockGenders,
  mockContactInformation, mockPerson,
} from '@/entities/beneficiary';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import _merge from 'lodash/merge';
import Component from './IdentityForm.vue';

const mockPersonModified = mockPerson();
mockPersonModified.birthDate.year = '1999';
mockPersonModified.birthDate.day = '12';
mockPersonModified.birthDate.month = '2';

const localVue = createLocalVue();
const storage = mockStorage();

describe('IdentityForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: _merge(mockContactInformation(), mockPersonModified),
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('gendersItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.gendersItems).toEqual(mockGenders());
      });
    });

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
            form: _merge(mockContactInformation(), mockPersonModified),
            minAgeRestriction: 15,
          },
        });
        expect(wrapper.vm.birthDateRule).toEqual({
          required: true,
          birthday: { birthdate: wrapper.vm.computedBirthdate },
          minimumAge: { birthdate: wrapper.vm.computedBirthdate, age: wrapper.vm.minAgeRestriction },
        });
      });

      it('should return proper data if age restriction is disabled', () => {
        expect(wrapper.vm.birthDateRule).toEqual({
          required: true,
          birthday: { birthdate: wrapper.vm.computedBirthdate },
        });
      });
    });
  });

  describe('Template', () => {

  });

  describe('Methods', () => {
    describe('prePopulate', () => {
      it('should assign default value for gender', () => {
        wrapper.vm.formCopy.gender = null;
        const defaultGender = wrapper.vm.gendersItems.find((option) => option.isDefault);

        wrapper.vm.prePopulate();
        expect(wrapper.vm.formCopy.gender).toEqual(defaultGender);
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: _merge(mockContactInformation(), mockPersonModified),
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
  });

  describe('Life cycle hooks', () => {
    test('data are pre populated in the mounted method', async () => {
      wrapper.vm.prePopulate = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.prePopulate).toHaveBeenCalledTimes(1);
    });
  });
});
