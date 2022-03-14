import Component from '../../components/atoms/RcPhoneDisplay.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcPhoneDisplay.vue', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  describe('Phone number', () => {
    it('shows phone number correctly', () => {
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
        propsData: {
          value: '+15144567777',
        },
      });

      const element = wrapper.find('span[data-test="phone-number"]');
      expect(wrapper.vm.formattedPhoneNumber).toBe('1 (514) 456-7777');
      expect(element.text()).toBe('1 (514) 456-7777');
    });

    test('When value is an invalid phone number, it displays the value untouched', () => {
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
        propsData: {
          value: '+15147777',
        },
      });

      const element = wrapper.find('span[data-test="phone-number"]');
      expect(wrapper.vm.formattedPhoneNumber).toBe('+15147777');
      expect(element.text()).toBe('+15147777');
    });

    test('When showCountryCode is false, it does not show the country code', () => {
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
        propsData: {
          value: '+15144567777',
          showCountryCode: false,
        },
      });

      const element = wrapper.find('span[data-test="phone-number"]');
      expect(wrapper.vm.formattedPhoneNumber).toBe('(514) 456-7777');
      expect(element.text()).toBe('(514) 456-7777');
    });
  });
});
