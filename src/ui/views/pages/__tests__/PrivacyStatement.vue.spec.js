import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { Beneficiary } from '@/entities/beneficiary';
import moment from 'moment';
import Component from '../PrivacyStatement.vue';

const localVue = createLocalVue();

describe('PersonalInformation.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
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
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
        },
        stubs: ['i18n'],
      });
    });

    describe('Event handlers', () => {
      test('event is emitted when isPrivacyAgreed change', async () => {
        wrapper.vm.form.isPrivacyAgreed = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update-entity')).toBeTruthy();
      });

      test('method is triggered when isPrivacyAgreed change', async () => {
        wrapper.vm.setTimeDateConsent = jest.fn();

        wrapper.vm.form.isPrivacyAgreed = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.setTimeDateConsent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          beneficiary: new Beneficiary(),
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

  describe('Methods', () => {
    describe('setTimeDateConsent', () => {
      it('sets timestamp if privacy statement is agreed', async () => {
        wrapper.vm.setTimeDateConsent(true);

        expect(wrapper.vm.form.privacyDateTimeConsent).toBe(moment().format());
      });

      it('clears timestamp if privacy statement is not agreed', async () => {
        wrapper.vm.setTimeDateConsent(false);

        expect(wrapper.vm.form.privacyDateTimeConsent).toBeNull();
      });
    });
  });
});
