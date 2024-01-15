import helpers from '@libs/component-lib/helpers';
import Component from '../../components/atoms/VDataTableA11y.vue';
import { createLocalVue, mount } from '../testSetup';

describe('VDataTableA11y.spec.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('Mounted', () => {
    test('calls setDataTableA11y', () => {
      wrapper.vm.setDataTableA11y = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.setDataTableA11y).toHaveBeenCalled();
    });
  });

  describe('setPaginationA11y', () => {
    test('calls helper with the right arguments', async () => {
      helpers.setElementA11yAttribute = jest.fn();
      document.querySelector = jest.fn(() => ({ id: 'test-id' }));
      await wrapper.vm.setPaginationA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-data-footer__select .v-input__slot', 'aria-controls', 'test-id', wrapper.vm.$refs.vDataTableA11y.$el);
    });
  });

  describe('setDataTableA11y', () => {
    test('call setElementA11yAttribute with proper params', async () => {
      wrapper.vm.setValueForExpandRowIconTableHeader = jest.fn();
      await wrapper.vm.setDataTableA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(wrapper.vm.setValueForExpandRowIconTableHeader).toHaveBeenCalled();
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-data-footer__select  .v-input__slot', 'role', 'combobox', wrapper.vm.$refs.vDataTableA11y.$el);
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith(
        '.text-start button.v-icon.v-data-table__expand-icon',
        'aria-label',
        'common.buttons.expand',
        wrapper.vm.$refs.vDataTableA11y.$el,
      );
    });
  });

  describe('setValueForExpandRowIconTableHeader', () => {
    test('should add transparent text to the empty span', () => {
      const element = {
        innerHTML: '',
        textContent: '',
        setAttribute: jest.fn(),
      };
      jest.spyOn(wrapper.vm.$refs.vDataTableA11y.$el, 'querySelectorAll').mockImplementation(() => ([element]));
      wrapper.vm.setValueForExpandRowIconTableHeader();
      expect(element.textContent).toEqual('a11y.empty_table_header_cell');
      expect(element.setAttribute).toHaveBeenCalledWith('class', 'rc-transparent-text');
    });

    test('should not add transparent text if span is not empty', () => {
      const element = {
        innerHTML: 'mock-content',
        textContent: '',
        setAttribute: jest.fn(),
      };
      jest.spyOn(wrapper.vm.$refs.vDataTableA11y.$el, 'querySelectorAll').mockImplementation(() => ([element]));
      wrapper.vm.setValueForExpandRowIconTableHeader();
      expect(element.textContent).toEqual('');
      expect(element.setAttribute).not.toHaveBeenCalled();
    });
  });
});
