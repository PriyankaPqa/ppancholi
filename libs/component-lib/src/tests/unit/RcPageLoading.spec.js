import Component from '../../components/atoms/RcPageLoading.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcPageLoading.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('Props', () => {
    test('color props is working well', async () => {
      const element = wrapper.find('[data-test="progress-circular"]');

      expect(element.classes('red--text')).toBe(false);

      wrapper.setProps({
        color: 'red',
      });
      await wrapper.vm.$nextTick();

      expect(element.classes('red--text')).toBe(true);
    });
  });
});
