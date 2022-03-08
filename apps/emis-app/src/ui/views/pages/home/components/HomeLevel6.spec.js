import { createLocalVue, shallowMount } from '@/test/testSetup';
import HomeLevel5 from '@/ui/views/pages/home/components/HomeLevel5.vue';
import Component from './HomeLevel6.vue';

const localVue = createLocalVue();

describe('HomeLevel6.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows HomeLevel1 component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(HomeLevel5)).toBeTruthy();
    });
  });
});
