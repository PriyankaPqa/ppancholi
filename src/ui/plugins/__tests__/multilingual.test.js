import { createLocalVue, mount } from '@vue/test-utils';
import multilingual from '../multilingual';

const Component = {
  template: '<div></div>',
};

const localVue = createLocalVue();
localVue.use(multilingual);

const testValue = {
  translation: {
    en: 'HELLO',
    fr: 'BONJOUR',
  },
};

describe('Multilingual plugin', () => {
  describe('Plugin is correctly installed', () => {
    test('adds a $m method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$m).toBe('function');
    });
  });

  describe('Translations', () => {
    test('it translates a multilingual value to the current locale', () => {
      let wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'en',
          },
        },
      });

      expect(wrapper.vm.$m(testValue)).toBe('HELLO');

      wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'fr',
          },
        },
      });

      expect(wrapper.vm.$m(testValue)).toBe('BONJOUR');
    });

    test('if the locale is not available in the translation values, it defaults to en', () => {
      const wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'de',
          },
        },
      });

      expect(wrapper.vm.$m(testValue)).toBe('HELLO');
    });

    test('if locale is not available and there is no default english value, an empty string is returned', () => {
      const wrapper = mount(Component, {
        localVue,
        mocks: {
          $i18n: {
            locale: 'de',
          },
        },
      });

      expect(wrapper.vm.$m({ value: {} })).toBe('');
    });
  });
});
