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

  describe('updated', () => {
    it('should call setDataTableFooterA11y', () => {
      wrapper.vm.setDataTableFooterA11y = jest.fn();
      wrapper.vm.$options.updated.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.setDataTableFooterA11y).toHaveBeenCalled();
    });
  });

  describe('setPaginationA11y', () => {
    test('calls helper with the right arguments', async () => {
      helpers.setElementA11yAttribute = jest.fn();
      document.querySelector = jest.fn(() => ({ id: 'test-id' }));
      await wrapper.vm.setPaginationA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-data-footer__select .v-input__slot', 'aria-controls', 'test-id', wrapper.vm.$refs.vDataTableA11y.$el);
    });
  });

  describe('setDataTableA11y', () => {
    test('call setElementA11yAttribute with proper params', async () => {
      wrapper.vm.setValueForEmptyTableHeader = jest.fn();
      await wrapper.vm.setDataTableA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(wrapper.vm.setValueForEmptyTableHeader).toHaveBeenCalled();
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith(
        '.text-start button.v-icon.v-data-table__expand-icon',
        'aria-label',
        'common.buttons.expand',
        wrapper.vm.$refs.vDataTableA11y.$el,
      );
    });
  });

  describe('setDataTableFooterA11y', () => {
    test('should call setElementA11yAttribute with proper params', async () => {
      helpers.setElementA11yAttribute = jest.fn();
      wrapper.vm.setDataTableFooterA11y();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-data-footer__select  .v-input__slot', 'role', 'combobox', wrapper.vm.$refs.vDataTableA11y.$el);
    });
  });

  describe('setValueForEmptyTableHeader', () => {
    test('should add transparent text to the empty span', () => {
      const element = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };
      const subElement = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        innerHTML: '',
        textContent: '',
      };
      element.querySelector = jest.fn(() => subElement);
      jest.spyOn(wrapper.vm.$refs.vDataTableA11y.$el, 'querySelectorAll').mockImplementation(() => ([element]));
      wrapper.vm.setValueForEmptyTableHeader();
      expect(subElement.textContent).toEqual('a11y.empty_table_header_cell');
      expect(subElement.setAttribute).toHaveBeenCalledWith('class', 'rc-transparent-text');
    });

    test('should not add transparent text if span is not empty', () => {
      const element = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };
      const subElement = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        innerHTML: 'mock-text',
        textContent: '',
      };
      element.querySelector = jest.fn(() => subElement);
      jest.spyOn(wrapper.vm.$refs.vDataTableA11y.$el, 'querySelectorAll').mockImplementation(() => ([element]));
      wrapper.vm.setValueForEmptyTableHeader();
      expect(subElement.setAttribute).not.toHaveBeenCalled();
    });

    test('should append child span if there isnt', () => {
      document.createElement = jest.fn(() => ({
        setAttribute: jest.fn(),
        textContent: '',
      }));
      const element = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        appendChild: jest.fn(),
      };
      element.querySelector = jest.fn();
      jest.spyOn(wrapper.vm.$refs.vDataTableA11y.$el, 'querySelectorAll').mockImplementation(() => ([element]));
      wrapper.vm.setValueForEmptyTableHeader();
      expect(document.createElement).toHaveBeenCalled();
      expect(element.appendChild).toHaveBeenCalled();
    });
  });
});
