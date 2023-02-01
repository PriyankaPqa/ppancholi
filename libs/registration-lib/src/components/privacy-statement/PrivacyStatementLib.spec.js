import moment from 'moment';
import { HouseholdCreate } from '@libs/entities-lib/src/household-create';
import { useMockRegistrationStore } from '@libs/stores-lib/src/registration/registration.mock';
import { createLocalVue, mount, shallowMount } from '../../test/testSetup';
import Component from './PrivacyStatementLib.vue';

const localVue = createLocalVue();
const { pinia, registrationStore } = useMockRegistrationStore();
describe('PrivacyStatementLib.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          household: new HouseholdCreate(),
          checkboxLabel: 'label',
        },
      });
      wrapper.vm.$registrationStore = registrationStore;
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
        expect(wrapper.vm.isPrivacyAgreed).toEqual(false);
      });

      it('calls setIsPrivacyAgreed with value', () => {
        wrapper.vm.isPrivacyAgreed = false;
        expect(wrapper.vm.$registrationStore.isPrivacyAgreed).toEqual(false);
      });

      it('calls setDateTimeConsent with null when unchecked', () => {
        wrapper.vm.isPrivacyAgreed = false;
        expect(wrapper.vm.$registrationStore.householdCreate.consentInformation.privacyDateTimeConsent).toEqual(null);
      });

      it('calls setDateTimeConsent with date of now if checked', () => {
        wrapper.vm.isPrivacyAgreed = true;
        expect(wrapper.vm.$registrationStore.householdCreate.consentInformation.privacyDateTimeConsent).toEqual(moment.utc(moment()).format());
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
