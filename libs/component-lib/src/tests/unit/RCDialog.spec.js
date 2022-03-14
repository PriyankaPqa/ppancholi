import Component from '../../components/atoms/RcDialog.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcDialog.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        title: 'Test Dialog',
        show: true,
        submitActionLabel: 'Submit',
        cancelActionLabel: 'Cancel',
        showHelp: true,
        minHeight: 45,
      },
      attrs: {
        persistent: false,
        dense: true,
        fullscreen: false,
      },
    });
  });

  describe('Props', () => {
    test('minHeight props is working well', async () => {
      const element = wrapper.find('.content-wrapper');
      wrapper.setProps({
        minHeight: 20,
      });
      await wrapper.vm.$nextTick();
      expect(element.attributes('style')).toBe('min-height: 20px;');
    });
    test('contentOnlyScrolling props is working well', async () => {
      const element = wrapper.find('.dialog-card');
      wrapper.setProps({
        contentOnlyScrolling: true,
      });
      await wrapper.vm.$nextTick();
      expect(element.classes()).toContain('content-only-scroll');
      wrapper.setProps({
        contentOnlyScrolling: false,
      });
      await wrapper.vm.$nextTick();
      expect(element.classes('content-only-scroll')).toBe(false);
    });
    test('title props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-title"]');
      expect(element.text()).toBe('Test Dialog');
    });
    test('submitActionLabel props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-submit-action"]');
      expect(element.text()).toBe('Submit');
    });
    test('cancelActionLabel props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-cancel-action"]');
      expect(element.text()).toBe('Cancel');
    });
    test('showHelp props is working well', async () => {
      const element = wrapper.find('[data-test="showHelp"]');
      expect(element.exists()).toBe(true);
      wrapper.setProps({
        showHelp: false,
      });
      await wrapper.vm.$nextTick();
      expect(element.exists()).toBe(false);
    });
    test('submitButtonDisabled props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-submit-action"]');
      expect(element.attributes('disabled')).toBeFalsy();
      wrapper.setProps({
        submitButtonDisabled: true,
      });
      await wrapper.vm.$nextTick();
      expect(element.attributes('disabled')).toBe('disabled');
    });
    test('showSubmit props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-submit-action"]');
      expect(element.exists()).toBe(true);
      wrapper.setProps({
        showSubmit: false,
      });
      await wrapper.vm.$nextTick();
      expect(element.exists()).toBe(false);
    });
    test('showCancel props is working well', async () => {
      const element = wrapper.find('[data-test="dialog-cancel-action"]');
      expect(element.exists()).toBe(true);
      wrapper.setProps({
        showCancel: false,
      });
      await wrapper.vm.$nextTick();
      expect(element.exists()).toBe(false);
    });
  });
  describe('Computed', () => {
    test('isPersistent', async () => {
      const computed = wrapper.vm.isPersistent;
      expect(computed).toBe(false);
    });
    test('isDense', async () => {
      const computed = wrapper.vm.isDense;
      expect(computed).toBe(true);
    });
    test('isFullScreenMode', async () => {
      const computed = wrapper.vm.isFullScreenMode;
      expect(computed).toBe(false);
    });
    test('minHeightContent', async () => {
      const computed = wrapper.vm.minHeightContent;
      expect(computed).toBe('45px');
    });
  });
});
