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

  const doMount = (isEditMode = true) => {
    storage = mockStorage();
    referral = referral || (isEditMode ? mockCombinedCaseFileReferral().entity : new CaseFileReferralEntity());
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        isEditMode,
        referral: new CaseFileReferralEntity(referral),
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
        expect(storage.caseFileReferral.actions.fetchTypes).toHaveBeenCalled();
        expect(storage.caseFileReferral.actions.fetchOutcomeStatuses).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('referralTypes', () => {
      it('calls storage and passes current value', async () => {
        doMount();
        expect(wrapper.vm.$storage.caseFileReferral.getters.types).toHaveBeenCalledWith(true, '09bda590-ad8b-4f29-af4e-c63eedd337a0');
        await wrapper.setData({ localReferral: { type: { optionItemId: null } } });
        expect(wrapper.vm.$storage.caseFileReferral.getters.types).toHaveBeenCalledWith(true, null);
      });
    });
    describe('outcomeStatuses', () => {
      it('calls storage and passes current value', async () => {
        doMount();
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: 'abc' } } });
        expect(wrapper.vm.$storage.caseFileReferral.getters.outcomeStatuses).toHaveBeenCalledWith(true, 'abc');
        await wrapper.setData({ localReferral: { outcomeStatus: { optionItemId: null } } });
        expect(wrapper.vm.$storage.caseFileReferral.getters.outcomeStatuses).toHaveBeenCalledWith(true, null);
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

    describe('resetConsent', () => {
      it('sets referralConsentInformation to null', async () => {
        doMount();
        await wrapper.setData({ localReferral: { referralConsentInformation: { dateTimeConsent: new Date() } } });
        await wrapper.vm.resetConsent();
        expect(wrapper.vm.localReferral.referralConsentInformation).toBeNull();
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
  });
});
