import Component from '../../components/atoms/RcTooltip.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcTooltip.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('Template', () => {
    describe('Props', () => {
      test('default color props is correct', () => {
        expect(wrapper.vm.color).toBe('grey darken-4');
      });

      test('default openDelay props is correct', () => {
        expect(wrapper.vm.openDelay).toBe(300);
      });
    });
  });
});
