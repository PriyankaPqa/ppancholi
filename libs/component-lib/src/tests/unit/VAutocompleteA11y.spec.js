import helpers from '@libs/component-lib/helpers';
import Component from '../../components/atoms/VAutocompleteA11y.vue';
import { createLocalVue, mount } from '../testSetup';

describe('VAutocompleteA11y.spec.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        errors: ['mock-errors'],
        classes: {},
      },
    });
  });

  describe('setA11yAttribute', () => {
    test('calls helper with the right arguments', () => {
      const element = {
        'aria-owns': 'id-123',
        getAttribute: jest.fn(() => 'id-123'),
      };
      jest.spyOn(wrapper.vm.$refs.vAutocomplete.$el, 'querySelector').mockImplementation(() => (element));
      helpers.setElementA11yAttribute = jest.fn();
      document.querySelector = jest.fn(() => ({ id: 'test-id' }));
      wrapper.vm.setA11yAttribute();
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-list.v-select-list.v-sheet', 'aria-busy', 'true', wrapper.vm.$refs.vAutocomplete.$el);
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-input__slot', 'aria-controls', 'id-123', wrapper.vm.$refs.vAutocomplete.$el);
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
