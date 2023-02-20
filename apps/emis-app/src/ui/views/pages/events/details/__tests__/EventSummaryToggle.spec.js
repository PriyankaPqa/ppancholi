import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import Component from '@/ui/views/pages/events/details/components/EventSummaryToggle.vue';

const localVue = createLocalVue();

describe('EventSummaryToggle.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        updating: false,
        titleOfToggle: '',
        isLastChild: false,
        toggleValue: false,
      },
      ...additionalOverwrites,
    });
    jest.clearAllMocks();
  };

  describe('Template', () => {
    describe('event-summary-toggle-title', () => {
      it('should render the title from props', async () => {
        await mountWrapper();
        await wrapper.setProps({
          titleOfToggle: 'test-title-content',
        });
        const element = wrapper.findDataTest('event-summary-toggle-title');
        expect(element.text()).toEqual('test-title-content');
      });

      it('should have class last-child-border when props isLastChild is true', async () => {
        await mountWrapper();
        await wrapper.setProps({
          isLastChild: true,
        });
        const element = wrapper.findDataTest('event-summary-toggle-title');
        expect(element.classes('last-child-border')).toBe(true);
      });

      it('should have class child-border when props isLastChild is false', async () => {
        await mountWrapper();
        await wrapper.setProps({
          isLastChild: false,
        });
        const element = wrapper.findDataTest('event-summary-toggle-title');
        expect(element.classes('child-border')).toBe(true);
      });
    });

    describe('event-summary-toggle-switch', () => {
      it('should emit event toggleChanged when emitted', async () => {
        await mountWrapper();
        const element = wrapper.findDataTest('event-summary-toggle-switch');
        element.vm.$emit('change');
        expect(wrapper.emitted('toggleChanged')).toBeTruthy();
      });
    });
  });
});
