import helpers from '@libs/component-lib/helpers';
import Component from '../../components/atoms/VSelectA11y.vue';
import { createLocalVue, mount } from '../testSetup';

describe('VSelectA11y.spec.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('Mounted', () => {
    test('calls helper with the right arguments', () => {
      helpers.setElementA11yAttribute = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-input__slot', 'role', 'combobox', wrapper.vm.$refs.vSelectA11y.$el);
    });
  });

  describe('setMenuA11y', () => {
    test('calls helper with the right arguments', async () => {
      helpers.setElementA11yAttribute = jest.fn();
      document.querySelector = jest.fn(() => ({ id: 'test-id' }));
      await wrapper.vm.setMenuA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-input__slot', 'aria-controls', 'test-id', wrapper.vm.$refs.vSelectA11y.$el);
    });
  });

  describe('watch', () => {
    test('selectedItem should be updated properly when props value changed', async () => {
      await wrapper.setProps({
        value: 1,
      });
      await wrapper.setData({
        selectedItem: 1,
      });
      await wrapper.setProps({
        value: null,
      });
      expect(wrapper.vm.selectedItem).toEqual(null);
    });
  });
});
