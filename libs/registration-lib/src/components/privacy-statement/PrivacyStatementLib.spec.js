import { HouseholdCreate } from '@libs/entities-lib/src/household-create';
import { useMockRegistrationStore } from '@libs/stores-lib/src/registration/registration.mock';
import { format, utcToZonedTime } from 'date-fns-tz';
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
        expect(wrapper.vm.$registrationStore.householdCreate.consentInformation.privacyDateTimeConsent).toEqual(
          format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss'Z'", { timeZone: 'UTC' }),
        );
      });
    });

    describe('activeStatementText', () => {
      beforeEach(() => {
        const consent = { id: 'id-1', name: { translation: { en: 'hello' } }, statement: { translation: { en: 'hello' } } };
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            checkboxLabel: 'label',
            consentStatement: consent,
          },
          mocks: {
            $t: (k) => k,
          },
        });
      });

      it('returns correct value if website placeholder is found', async () => {
        await wrapper.vm.activeStatementText;
        wrapper.vm.consentStatement.statement.translation.en = '{website} more';
        const url = wrapper.vm.$t('registration.privacy_statement.website', 'en');
        expect(wrapper.vm.activeStatementText).toEqual(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a> more`,
        );
      });

      it('returns correct value if email placeholder is found', async () => {
        await wrapper.vm.activeStatementText;
        wrapper.vm.consentStatement.statement.translation.en = '{email} more';
        expect(wrapper.vm.activeStatementText).toEqual(
          `<a href="mailto:${wrapper.vm.$t('registration.privacy_statement.email', 'en')}">${wrapper.vm.$t('registration.privacy_statement.email', 'en')}</a> more`,
        );
      });

      it('returns correct value if either website nor email placeholder is found', async () => {
        await wrapper.vm.activeStatementText;
        wrapper.vm.consentStatement.statement.translation.en = 'statement';
        expect(wrapper.vm.activeStatementText).toEqual(
          'statement',
        );
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
