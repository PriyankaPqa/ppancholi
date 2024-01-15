import helpers from '@libs/component-lib/helpers';
import Component from '../../components/atoms/VCheckboxWithValidation.vue';
import { createLocalVue, mount } from '../testSetup';

describe('VCheckboxWithValidation.spec.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('mounted', () => {
    test('calls setA11yAttribute', () => {
      wrapper.vm.setA11yAttribute = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.setA11yAttribute).toHaveBeenCalled();
    });
  });

  describe('setA11yAttribute', () => {
    test('calls helper with the right arguments', async () => {
      const element = {
        id: 'id-123',
      };
      wrapper.vm.$refs.vCheckbox.$el.querySelector = jest.fn(() => (element));
      helpers.setElementA11yAttribute = jest.fn();
      await wrapper.vm.setA11yAttribute();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith(
        '.v-input__slot > .v-input--selection-controls__input',
        'aria-controls',
        'id-123',
        wrapper.vm.$refs.vCheckbox.$el,
      );
    });
  });
});
