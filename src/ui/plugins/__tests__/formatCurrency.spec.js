/**
 * @group ui/plugins
 */

import { createLocalVue, mount } from '@vue/test-utils';
import formatCurrency from '../formatCurrency';

const Component = {
  template: '<div></div>',
};

const localVue = createLocalVue();
localVue.use(formatCurrency);

describe('Format Currency plugin', () => {
  describe('Plugin is correctly installed', () => {
    test('adds a $formatCurrency method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$formatCurrency).toBe('function');
    });
  });

  describe('Currency formatting', () => {
    test('it formats a number in the correct format in English', () => {
      // Note: can't test in other languages because Node doesn't have full Intl implementation
      const wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'en',
          },
        },
      });

      const input = 1234.567;

      const output = wrapper.vm.$formatCurrency(input);

      expect(output).toBe('$1,234.57');
    });

    test('passing the hideDecimals boolean hides the decimal places for a whole number', () => {
      const wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'en',
          },
        },
      });

      const input = 1234;

      const output = wrapper.vm.$formatCurrency(input, true);

      expect(output).toBe('$1,234');
    });

    test('passing the hideDecimals boolean does not affect a fractional number', () => {
      const wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'en',
          },
        },
      });

      const input = 1234.567;

      const output = wrapper.vm.$formatCurrency(input, true);

      expect(output).toBe('$1,234.57');
    });
  });
});
