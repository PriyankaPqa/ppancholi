import { createLocalVue, shallowMount } from '@/test/testSetup';
import HomeLevel1 from '@/ui/views/pages/home/layout/HomeLevel1.vue';
import Component from './HomeLevel2.vue';

const localVue = createLocalVue();

describe('HomeLevel2.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows HomeLevel1 component', () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(HomeLevel1)).toBeTruthy();
    });
  });
});
