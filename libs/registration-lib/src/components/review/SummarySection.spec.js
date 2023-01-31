import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './SummarySection.vue';

const localVue = createLocalVue();

describe('SummarySection.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        title: 'testTitle',
        inlineEdit: false,
      },
    });
  });

  describe('Template', () => {
    it('displays the title correctly', async () => {
      const title = wrapper.find('[data-test="title"]');
      expect(title.text()).toBe('testTitle');
    });

    it('shows edit button if inline mode is false', async () => {
      const editButton = wrapper.find('[data-test="inlineEdit__open__testTitle"]');
      expect(editButton.exists()).toBe(true);
    });

    it('hide edit button if inline mode is true', async () => {
      await wrapper.setProps({ inlineEdit: true });
      const editButton = wrapper.find('[data-test="inlineEdit__open__testTitle"]');
      expect(editButton.exists()).toBe(false);
    });
  });

  describe('Methods', () => {
    describe('edit', () => {
      it('should be called when clicking the edit button', async () => {
        jest.spyOn(wrapper.vm, 'edit');
        const button = wrapper.find('[data-test="inlineEdit__open__testTitle"]');
        await button.trigger('click');
        expect(wrapper.vm.edit).toHaveBeenCalledTimes(1);
      });

      it('should emit edit event', () => {
        wrapper.vm.edit();
        expect(wrapper.emitted('edit')).toBeTruthy();
      });
    });

    describe('cancel', () => {
      beforeEach(() => {
        wrapper.setProps({
          inlineEdit: true,
        });
      });

      it('should be called when clicking the cancel button', async () => {
        jest.spyOn(wrapper.vm, 'cancel');
        const button = wrapper.find('[data-test="inlineEdit__cancel__testTitle"]');
        await button.trigger('click');
        expect(wrapper.vm.cancel).toHaveBeenCalledTimes(1);
      });

      it('should emit edit cancel', () => {
        wrapper.vm.cancel();
        expect(wrapper.emitted('cancel')).toBeTruthy();
      });
    });

    describe('onSubmit', () => {
      beforeEach(() => {
        wrapper.setProps({
          inlineEdit: true,
        });
      });

      it('should be called when clicking the submit button', async () => {
        jest.spyOn(wrapper.vm, 'onSubmit');
        const button = wrapper.find('[data-test="inlineEdit__save__testTitle"]');
        await button.trigger('click');
        expect(wrapper.vm.onSubmit).toHaveBeenCalledTimes(1);
      });

      it('should emit submit cancel', () => {
        wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')).toBeTruthy();
      });
    });
  });
});
