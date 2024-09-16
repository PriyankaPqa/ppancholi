import helpers from '@libs/component-lib/helpers';
import Component from '../../components/atoms/VueEditorA11y.vue';
import { createLocalVue, mount } from '../testSetup';

describe('VueEditorA11y.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('Mounted', () => {
    test('calls setButtonsA11y', () => {
      wrapper.vm.setButtonsA11y = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.setButtonsA11y).toHaveBeenCalled();
    });
  });

  describe('setButtonsA11y', () => {
    test('calls calls helper with the right arguments', async () => {
      helpers.setElementA11yAttribute = jest.fn();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalled();
    });
  });
});
