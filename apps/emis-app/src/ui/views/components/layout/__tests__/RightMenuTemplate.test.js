import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import Component from '../RightMenuTemplate.vue';

const localVue = createLocalVue();

describe('RightMenuTemplate.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      ...otherOptions,
    });
  };

  beforeEach(async () => {
    await mountWrapper(true, {
      propsData: {
        show: true,
        titleKey: 'rightmenu.title',
      },
      slots: {
        main: 'Main content',
        footer: 'Footer content',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      it('should show the title', () => {
        const text = wrapper.find('[data-test="toolbar-title"]');
        expect(text.text()).toEqual(wrapper.vm.titleKey);
      });
    });

    describe('slots', () => {
      it('should have main content', () => {
        expect(wrapper.text()).toContain('Main content');
      });
      it('should have footer content', () => {
        expect(wrapper.text()).toContain('Footer content');
      });
    });

    describe('Event handlers', () => {
      it('should update show when close button clicked', async () => {
        wrapper.vm.updateShow = jest.fn();
        const btn = wrapper.find('[data-test="close-button"]');
        await btn.trigger('click');
        expect(wrapper.vm.updateShow).toBeCalledWith(false);
      });
    });

    describe('Methods', () => {
      it('should emit update:show when updateShow called', () => {
        wrapper.vm.updateShow(false);
        wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:show')).toBeTruthy();
      });
    });
  });
});
