import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { CaseFileReferralEntity, mockCaseFileReferralEntity, ReferralMethod } from '@libs/entities-lib/case-file-referral';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';

import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import Component from './ReferralForm.vue';

const localVue = createLocalVue();
const { pinia, caseFileReferralStore } = useMockCaseFileReferralStore();

describe('ReferralForm.vue', () => {
  let wrapper;
  let referral;

  const doMount = (isEditMode = true, shallow = true) => {
    referral = referral || (isEditMode ? mockCaseFileReferralEntity() : new CaseFileReferralEntity());
    const options = {
      localVue,
      pinia,
      propsData: {
        isEditMode,
        referral: new CaseFileReferralEntity(referral),
      },

    };
    if (shallow) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    referral = null;
  });

  describe('created', () => {
    describe('data', () => {
      it('is initialized with props', () => {
        referral = mockCaseFileReferralEntity();
        referral.outcomeStatus = null;
        referral.referralConsentInformation = null;
        doMount();
        expect(wrapper.vm.localReferral.id).toEqual(referral.id);
        expect(wrapper.vm.localReferral.outcomeStatus.optionItemId).toEqual(null);

        referral.outcomeStatus = { optionItemId: 'abc' };
        referral.referralConsentInformation = { dateTimeConsent: new Date('2020-01-01') };
        doMount();
        expect(wrapper.vm.localReferral.id).toEqual(referral.id);
        expect(wrapper.vm.localReferral.outcomeStatus.optionItemId).toEqual('abc');
      });
    });
    describe('fetches', () => {
      it('it fetches from store', async () => {
        doMount();
        await wrapper.vm.$nextTick();
        expect(caseFileReferralStore.fetchTypes).toHaveBeenCalled();
        expect(caseFileReferralStore.fetchOutcomeStatuses).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('referralTypes', () => {
      it('calls the store and passes current value', async () => {
        doMount();
        expect(caseFileReferralStore.getAllTypes).toHaveBeenCalledWith(true, '09bda590-ad8b-4f29-af4e-c63eedd337a0');
        await wrapper.setData({ localReferral: { type: { optionItemId: null } } });
        expect(caseFileReferralStore.getAllTypes).toHaveBeenCalledWith(true, null);
      });
    });
    describe('outcomeStatuses', () => {
      it('calls the store and passes current value', async () => {
        doMount();
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: 'abc' } } });
        expect(caseFileReferralStore.getAllOutcomeStatuses).toHaveBeenCalledWith(true, 'abc');
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: null } } });
        expect(caseFileReferralStore.getAllOutcomeStatuses).toHaveBeenCalledWith(true, null);
      });
    });
  });

  describe('Methods', () => {
    describe('updateMethod', () => {
      it('sets method to null if referralConsentInformation is empty', async () => {
        doMount();
        await wrapper.setData({ localReferral: { referralConsentInformation: null, method: ReferralMethod.Warm } });
        await wrapper.vm.updateMethod();
        expect(wrapper.vm.localReferral.method).toBeNull();
      });
    });

    describe('confirmResetConsent', () => {
      it('sets referralConsentInformation to null if not in edit mode', async () => {
        doMount(false);
        await wrapper.setData({ localReferral: { referralConsentInformation: { dateTimeConsent: new Date() } } });
        await wrapper.vm.confirmResetConsent();
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
      });

      it('opens confirmation popup if in edit mode and  warm referral method is selected', async () => {
        doMount();
        await wrapper.setData({ localReferral: { referralConsentInformation: { dateTimeConsent: new Date() } } });
        await wrapper.vm.confirmResetConsent();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.referral.resetConsentConfirm.title',
          messages: 'caseFile.referral.resetConsentConfirm.message.individual',
        });
      });

      it('keeps referral method as warm if confirmation is denied', async () => {
        doMount();
        await wrapper.setData({ localReferral: { referralConsentInformation: { dateTimeConsent: new Date() } } });
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.confirmResetConsent();
        expect(wrapper.vm.localReferral.method).toEqual(ReferralMethod.Warm);
      });

      it('sets referralConsentInformation to null if confirmation is accepted', async () => {
        doMount();
        await wrapper.setData({ localReferral: { referralConsentInformation: { dateTimeConsent: new Date() } } });
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.vm.confirmResetConsent();
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
      });
    });
  });

  describe('Validation', () => {
    let el;
    beforeEach(() => {
      doMount(false, false);
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
  });
});
