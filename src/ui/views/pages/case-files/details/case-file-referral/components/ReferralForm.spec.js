/**
 * @group ui/components/case-file
 */

/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { CaseFileReferralEntity, mockCombinedCaseFileReferral, ReferralMethod } from '@/entities/case-file-referral';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import Component from './ReferralForm.vue';

const localVue = createLocalVue();

describe('ReferralForm.vue', () => {
  let wrapper;
  let referral;
  let storage;

  const doMount = function (isEditMode = true) {
    storage = mockStorage();
    referral = referral || (isEditMode ? mockCombinedCaseFileReferral().entity : new CaseFileReferralEntity());
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        isEditMode,
        referral: new CaseFileReferralEntity(referral),
        isDirty: false,
      },
      mocks: {
        $storage: storage,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    referral = null;
  });

  describe('created', () => {
    describe('data', () => {
      it('is initialized with props', () => {
        referral = mockCombinedCaseFileReferral().entity;
        referral.outcomeStatus = null;
        referral.referralConsentInformation = null;
        doMount();
        expect(wrapper.vm.localReferral.id).toEqual(referral.id);
        expect(wrapper.vm.localReferral.outcomeStatus.optionItemId).toEqual(null);
        expect(wrapper.vm.consentChecked).toEqual(false);

        referral.outcomeStatus = { optionItemId: 'abc' };
        referral.referralConsentInformation = { dateTimeConsent: new Date('2020-01-01') };
        doMount();
        expect(wrapper.vm.localReferral.id).toEqual(referral.id);
        expect(wrapper.vm.localReferral.outcomeStatus.optionItemId).toEqual('abc');
        expect(wrapper.vm.consentChecked).toEqual(true);
      });
    });
    describe('fetches', () => {
      it('it fetches from store', async () => {
        doMount();
        await wrapper.vm.$nextTick();
        expect(storage.caseFileReferral.actions.fetchTypes).toHaveBeenCalled();
        expect(storage.caseFileReferral.actions.fetchOutcomeStatuses).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('referralTypes', () => {
      it('calls storage and passes current value', async () => {
        doMount();
        await wrapper.setData({ localReferral: { type: { optionItemId: 'abc' } } });
        let opt = wrapper.vm.referralTypes;
        expect(wrapper.vm.$storage.caseFileReferral.getters.types).toHaveBeenCalledWith(true, 'abc');
        await wrapper.setData({ localReferral: { type: { optionItemId: null } } });
        opt = wrapper.vm.referralTypes;
        expect(wrapper.vm.$storage.caseFileReferral.getters.types).toHaveBeenCalledWith(true, null);
      });
    });
    describe('outcomeStatuses', () => {
      it('calls storage and passes current value', async () => {
        doMount();
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: 'abc' } } });
        let opt = wrapper.vm.outcomeStatuses;
        expect(wrapper.vm.$storage.caseFileReferral.getters.outcomeStatuses).toHaveBeenCalledWith(true, 'abc');
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: null } } });
        opt = wrapper.vm.outcomeStatuses;
        expect(wrapper.vm.$storage.caseFileReferral.getters.outcomeStatuses).toHaveBeenCalledWith(true, null);
      });
    });

    describe('showConsent', () => {
      it('is true when referral method is warm', async () => {
        doMount();
        await wrapper.setData({ localReferral: { method: ReferralMethod.Warm } });
        expect(wrapper.vm.showConsent).toBe(true);
        await wrapper.setData({ localReferral: { method: ReferralMethod.Referral } });
        expect(wrapper.vm.showConsent).toBe(false);
      });

      it('flushes consent data when false', async () => {
        doMount();
        await wrapper.setData({
          localReferral: {
            method: ReferralMethod.Warm,
          },
          consentChecked: true,
        });
        expect(wrapper.vm.localReferral.referralConsentInformation).not.toBeNull();
        await wrapper.setData({ localReferral: { method: ReferralMethod.Referral } });
        expect(wrapper.vm.consentChecked).toBeFalsy();
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
      });
    });
  });

  describe('Watch', () => {
    describe('consentChecked', () => {
      it('flushes referralConsentInformation when false', async () => {
        doMount();
        await wrapper.setData({
          localReferral: {
            method: ReferralMethod.Warm,
            referralConsentInformation: { dateTimeConsent: new Date()}
          },
          consentChecked: true,
        });
        expect(wrapper.vm.localReferral.referralConsentInformation).not.toBeNull();
        await wrapper.setData({ consentChecked: false });
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
      });

      it('sets referralConsentInformation when true', async () => {
        doMount();
        await wrapper.setData({
          localReferral: {
            method: ReferralMethod.Warm,
          },
          consentChecked: false,
        });
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
        await wrapper.setData({ consentChecked: true });
        expect(wrapper.vm.localReferral.referralConsentInformation).not.toBeNull();
        expect(wrapper.vm.localReferral.referralConsentInformation.dateTimeConsent).not.toBeNull();
        expect(wrapper.vm.localReferral.referralConsentInformation.crcUserName).not.toBeNull();
        expect(wrapper.vm.localReferral.referralConsentInformation.crcUserId).not.toBeNull();
      });
    });
  });

  describe('Validation', () => {
    let el;
    beforeAll(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          isEditMode: false,
          referral: new CaseFileReferralEntity(),
          isDirty: false,
        },
      });
    });

    test('referral name is required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-name');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localReferral: { name: 'abc' } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-name');
      expect(el.classes('invalid')).toBe(false);
    });

    test('the referral name has a max length of MAX_LENGTH_MD', async () => {
      await wrapper.setData({ localReferral: { name: 'x'.repeat(MAX_LENGTH_MD + 1) } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-name');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localReferral: { name: 'x'.repeat(MAX_LENGTH_MD - 1) } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-name');
      expect(el.classes('invalid')).toBe(false);
    });

    test('referral type is required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findSelectWithValidation('referral-type');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localReferral: { type: { optionItemId: 'abc' } } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findSelectWithValidation('referral-type');
      expect(el.classes('invalid')).toBe(false);
    });

    test('notes is not required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-notes');
      expect(el.classes('invalid')).toBe(false);
      await wrapper.setData({ localReferral: { name: 'abc' } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('referral-notes');
      expect(el.classes('invalid')).toBe(false);
    });

    test('consent is required when warm', async () => {
      await wrapper.setData({ localReferral: { method: ReferralMethod.Warm } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('checkbox-consent');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ consentChecked: true });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('checkbox-consent');
      expect(el.classes('invalid')).toBe(false);
      await wrapper.setData({ consentChecked: false });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('checkbox-consent');
      expect(el.classes('invalid')).toBe(true);
    });
  });
});
