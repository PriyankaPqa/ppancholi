import { createLocalVue, shallowMount } from '@/test/testSetup';

import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import Component from './WarmReferralConsent.vue';

const localVue = createLocalVue();
const { pinia } = useMockCaseFileReferralStore();

describe('WarmReferralConsent.vue', () => {
  let wrapper;

  const doMount = () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        referralConsentInformation: null,
      },

    });
  };

  describe('Watch', () => {
    describe('consentChecked', () => {
      it('flushes referralConsentInformation when false', async () => {
        doMount();
        await wrapper.setData({
          localConsentInfo: { dateTimeConsent: new Date() },
          consentChecked: true,
        });
        expect(wrapper.vm.localConsentInfo).not.toBeNull();
        await wrapper.setData({ consentChecked: false });
        expect(wrapper.vm.localConsentInfo).toBeNull();
      });

      it('sets referralConsentInformation when true', async () => {
        doMount();
        await wrapper.setData({
          consentChecked: false,
        });
        expect(wrapper.vm.localConsentInfo).toBeNull();
        await wrapper.setData({ consentChecked: true });
        expect(wrapper.vm.localConsentInfo).not.toBeNull();
        expect(wrapper.vm.localConsentInfo.dateTimeConsent).not.toBeNull();
        expect(wrapper.vm.localConsentInfo.crcUserName).not.toBeNull();
        expect(wrapper.vm.localConsentInfo.crcUserId).not.toBeNull();
      });
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it(' emits updateMethod', async () => {
        doMount();
        wrapper.vm.$refs.consent.reset = jest.fn();
        await wrapper.vm.close();
        expect(wrapper.emitted('updateMethod')).toBeTruthy();
      });

      it('emits  update:show', async () => {
        doMount();
        wrapper.vm.$refs.consent.reset = jest.fn();
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('submit', () => {
      it('calls validate', async () => {
        doMount();
        wrapper.vm.$refs.consent.validate = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.$refs.consent.validate).toBeCalledTimes(1);
      });
      it('if validate is true, it emits show false', async () => {
        doMount();
        wrapper.vm.$refs.consent.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('if validate is true, it emits update:referralConsentInformation with the localConsentInfo data', async () => {
        const localConsentInfo = { dateTimeConsent: new Date() };
        doMount();
        wrapper.vm.$refs.consent.validate = jest.fn(() => true);
        await wrapper.setData({ localConsentInfo });
        await wrapper.vm.submit();
        expect(wrapper.emitted('update:referralConsentInformation')[0][0]).toEqual(localConsentInfo);
      });
    });
  });
});
