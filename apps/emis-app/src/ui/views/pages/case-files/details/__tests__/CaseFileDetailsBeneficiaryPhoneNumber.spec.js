/**
 * @group ui/components/case-file
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';

import Component from '../components/CaseFileDetailsBeneficiaryPhoneNumber.vue';

const localVue = createLocalVue();

describe('CaseFileDetailsBeneficiaryPhoneNumber.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          phoneNumber: {
            number: '514-444-5555',
            extension: '123',
          },
          label: 'mock-label',
        },
      });
    });

    describe('phone number', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('caseFileDetails-beneficiary-phone-number');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        const element = wrapper.findDataTest('caseFileDetails-beneficiary-phone-number');
        expect(element.text()).toContain(wrapper.vm.phoneNumber.number);
      });
    });

    describe('phone number extension', () => {
      it('is rendered if it exists', () => {
        const element = wrapper.findDataTest('caseFileDetails-beneficiary-phone-number-extension');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        const element = wrapper.findDataTest('caseFileDetails-beneficiary-phone-number-extension');
        expect(element.text()).toContain(wrapper.vm.phoneNumber.extension);
      });

      it('does not display if the extension is empty', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            phoneNumber: {
              number: '514-444-5555',
              extension: null,
            },
            label: 'mock-label',
          },
        });

        const element = wrapper.findDataTest('caseFileDetails-beneficiary-phone-number-extension');
        expect(element.exists()).toBeFalsy();
      });
    });
  });
});
