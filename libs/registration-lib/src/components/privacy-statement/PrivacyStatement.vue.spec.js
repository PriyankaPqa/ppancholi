import moment from 'moment';
import { HouseholdCreate } from '@libs/entities-lib/src/household-create';
import { createLocalVue, mount, shallowMount } from '../../test/testSetup';
import { mockStorage } from '../../store/storage';
import Component from './PrivacyStatement.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PrivacyStatement.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          household: new HouseholdCreate(),
          checkboxLabel: 'label',
        },
        store: {
          modules: {
            registration: {
              state: {
                isPrivacyAgreed: true,
              },
            },
          },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('rules', () => {
      test('isPrivacyAgreed', () => {
        expect(wrapper.vm.rules.isPrivacyAgreed).toEqual({
          required: {
            allowFalse: false,
          },
        });
      });
    });

    describe('isPrivacyAgreed', () => {
      it('is linked to isPrivacyAgreed in the store', () => {
        expect(wrapper.vm.isPrivacyAgreed).toEqual(true);
      });

      it('calls setIsPrivacyAgreed with value', () => {
        wrapper.vm.isPrivacyAgreed = false;
        expect(wrapper.vm.$storage.registration.mutations.setIsPrivacyAgreed).toHaveBeenCalledWith(false);
      });

      it('calls setDateTimeConsent with null when unchecked', () => {
        wrapper.vm.isPrivacyAgreed = false;
        expect(wrapper.vm.$storage.registration.mutations.setDateTimeConsent).toHaveBeenCalledWith(null);
      });

      it('calls setDateTimeConsent with date of now if checked', () => {
        wrapper.vm.isPrivacyAgreed = true;
        expect(wrapper.vm.$storage.registration.mutations.setDateTimeConsent).toHaveBeenCalledWith(moment.utc(moment()).format());
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          household: new HouseholdCreate(),
          checkboxLabel: 'label',
        },
        stubs: ['i18n'],
      });
    });

    describe('isPrivacyAgreed', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('isPrivacyAgreed');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.isPrivacyAgreed);
      });
    });
  });
});
