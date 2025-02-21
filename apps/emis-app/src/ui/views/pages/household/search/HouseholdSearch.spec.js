import Vuetify from 'vuetify';
import { mockSplitHousehold } from '@libs/entities-lib/household-create';
import {
  createLocalVue,
  shallowMount, mount,
} from '@/test/testSetup';

import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';

import Component from './HouseholdSearch.vue';

const localVue = createLocalVue();

const vuetify = new Vuetify();

const { pinia, registrationStore } = useMockRegistrationStore();

describe('HouseholdSearch.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      vuetify,
      propsData: {
        loading: false,
        isSplitMode: false,
      },

    });
    wrapper.vm.$refs.form = {
      validate: jest.fn(() => true),
    };
  });

  describe('Methods', () => {
    describe('clear', () => {
      it('should clear form', () => {
        wrapper.setData({
          form: {
            firstName: 'test',
            lastName: 'test',
            emailAddress: 'test',
            phone: 'test',
            registrationNumber: 'test',
            birthDate: 'test',
          },
        });

        wrapper.vm.clear();

        expect(wrapper.vm.form).toEqual({
          firstName: '',
          lastName: '',
          emailAddress: '',
          phone: null,
          registrationNumber: '',
          birthDate: '',
        });
      });

      it('should clear phone', () => {
        wrapper.setData({
          phone: {
            number: 'test',
            countryISO2: 'test',
            e164Number: 'test',
          },
        });

        wrapper.vm.clear();
        expect(wrapper.vm.phone).toEqual({
          number: '',
          countryISO2: '',
          e164Number: '',
        });
      });

      it('should clear birthDate', () => {
        wrapper.setData({
          birthDate: {
            month: null,
            day: null,
            year: null,
          },
        });

        wrapper.vm.clear();
        expect(wrapper.vm.birthDate).toEqual({
          month: null,
          day: null,
          year: null,
        });
      });

      it('should set householdResultsShown to false', () => {
        registrationStore.householdResultsShown = true;
        wrapper.vm.clear();
        expect(registrationStore.householdResultsShown).toEqual(false);
      });

      it('should be called when clicking clear button', async () => {
        wrapper = mount(Component, {
          localVue,
          vuetify,
          propsData: {
            loading: false,
            isSplitMode: false,
          },

        });
        wrapper.vm.clear = jest.fn();
        const element = wrapper.findDataTest('clearForm');
        await element.vm.$emit('click');

        expect(wrapper.vm.clear).toBeCalledTimes(1);
      });
    });

    describe('search', () => {
      it('should trigger form validation', async () => {
        await wrapper.vm.search();

        expect(wrapper.vm.$refs.form.validate).toBeCalled();
      });

      it('should emit search event with criteria as params', async () => {
        wrapper.setData({
          form: {
            phone: 'test',
          },
        });

        await wrapper.vm.search();
        expect(wrapper.emitted('search')).toBeTruthy();
        expect(wrapper.emitted('search', [0][0])).toEqual([[wrapper.vm.nonEmptySearchCriteria]]);
      });

      it('should be called when clicking search button', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          vuetify,
          propsData: {
            loading: false,
            isSplitMode: false,
          },

        });
        wrapper.vm.search = jest.fn();
        const element = wrapper.findDataTest('search');
        await element.vm.$emit('click');

        expect(wrapper.vm.search).toBeCalledTimes(1);
      });
    });

    describe('fillInSplitHouseholdData', () => {
      it('fills in the right name data into the form', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          propsData: {
            loading: false,
            isSplitMode: false,
          },

        });
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        registrationStore.splitHouseholdState = mockSplitHousehold();
        await wrapper.vm.fillInSplitHouseholdData();
        expect(wrapper.vm.form.firstName).toEqual(mockSplitHousehold().splitMembers.primaryMember.identitySet.firstName);
        expect(wrapper.vm.form.lastName).toEqual(mockSplitHousehold().splitMembers.primaryMember.identitySet.lastName);
        expect(wrapper.vm.birthDate).toEqual(mockSplitHousehold().splitMembers.primaryMember.identitySet.birthDate);
      });
    });

    describe('storeBeneficiarySearchData', () => {
      const formWithOriginalDataStructure = {
        firstName: '',
        lastName: '',
        phone: {
          number: '',
          countryISO2: '',
          e164Number: '',
        },
        emailAddress: '',
        birthDate: {
          month: null,
          day: null,
          year: null,
        },
      };
      it('should call mutations function setInformationFromBeneficiarySearch', async () => {
        await wrapper.vm.storeBeneficiarySearchData();
        expect(registrationStore.informationFromBeneficiarySearch).toEqual(formWithOriginalDataStructure);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('create', () => {
      it('calls fillInSplitHouseholdData if is in split mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          propsData: {
            loading: false,
            isSplitMode: true,
          },

        });
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        jest.spyOn(wrapper.vm, 'fillInSplitHouseholdData').mockImplementation(() => {});

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fillInSplitHouseholdData).toHaveBeenCalledTimes(1);
      });
    });

    describe('beforeDestroy', () => {
      it('should call storeBeneficiarySearchData when the feature flag is on', () => {
        wrapper.vm.storeBeneficiarySearchData = jest.fn();
        wrapper.vm.$options.beforeDestroy.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.storeBeneficiarySearchData).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('nonEmptySearchCriteria', () => {
      it('should return non empty search criteria', () => {
        wrapper.setData({
          form: {
            firstName: 'test',
            lastName: 'test',
            emailAddress: 'test',
            phone: '',
            registrationNumber: 'test',
            birthDate: 'test',
          },
        });
        expect(wrapper.vm.nonEmptySearchCriteria).toEqual({
          birthDate: 'test',
          emailAddress: 'test',
          firstName: 'test',
          lastName: 'test',
          registrationNumber: 'test',
        });
      });
    });

    describe('rules', () => {
      it('should return correct rules', () => {
        const rules = {
          firstName: {
            max: MAX_LENGTH_MD,
          },
          lastName: {
            max: MAX_LENGTH_MD,
          },
          emailAddress: {
            max: MAX_LENGTH_MD,
            email: true,
          },
          phone: {
            phone: true,
          },
          registrationNumber: {
            registrationNumber: true,
          },
          month: {
            required: wrapper.vm.dateComponentNotEmpty,
            birthday: wrapper.vm.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
          },
          day: {
            required: wrapper.vm.dateComponentNotEmpty,
            birthday: wrapper.vm.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
          },
          year: {
            required: wrapper.vm.dateComponentNotEmpty,
            birthday: wrapper.vm.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
          },
        };
        expect(wrapper.vm.rules).toEqual(rules);
      });
    });

    describe('monthEmpty', () => {
      it('should return true if the month is empty', () => {
        wrapper.setData({
          birthDate: {
            month: null,
          },
        });
        expect(wrapper.vm.monthEmpty).toBeTruthy();

        wrapper.setData({
          birthDate: {
            month: '',
          },
        });
        expect(wrapper.vm.monthEmpty).toBeTruthy();
      });

      it('should return false if the month is not empty', () => {
        wrapper.setData({
          birthDate: {
            month: '01',
          },
        });
        expect(wrapper.vm.monthEmpty).toBeFalsy();
      });
    });

    describe('dateComponentNotEmpty', () => {
      it('should return true if any of date component is non empty', () => {
        wrapper.setData({
          birthDate: {
            month: '01',
            day: null,
            year: null,
          },
        });
        expect(wrapper.vm.dateComponentNotEmpty).toBeTruthy();
      });

      it('should return false if date is empty', () => {
        wrapper.setData({
          birthDate: {
            month: '',
            day: null,
            year: null,
          },
        });
        expect(wrapper.vm.dateComponentNotEmpty).toBeFalsy();
      });
    });

    describe('dateComponentFilled', () => {
      it('should return true if all of date component is non empty', () => {
        wrapper.setData({
          birthDate: {
            month: '01',
            day: '01',
            year: '2000',
          },
        });
        expect(wrapper.vm.dateComponentFilled).toBeTruthy();
      });

      it('should return false if part of the date is empty', () => {
        wrapper.setData({
          birthDate: {
            month: '01',
            day: null,
            year: '2000',
          },
        });
        expect(wrapper.vm.dateComponentFilled).toBeFalsy();
      });
    });
  });

  describe('watch', () => {
    describe('birthDate', () => {
      it('modifies the form field birthDate if the data is complete', async () => {
        await wrapper.setData({
          birthDate: {
            month: '01',
            day: '02',
            year: '2000',
          },
        });

        expect(wrapper.vm.form.birthDate).toEqual('2000-01-02');
      });

      it('modifies the form field birthDate if the data is complete', async () => {
        await wrapper.setData({ form: { ...wrapper.vm.form, birthDate: '2000-01-02' } });
        await wrapper.setData({
          birthDate: {
            month: '01',
            day: null,
            year: '2000',
          },
        });

        expect(wrapper.vm.form.birthDate).toEqual('');
      });
    });
  });
});
