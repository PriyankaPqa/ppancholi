import { createLocalVue, mount } from '@/test/testSetup';
import HomeLevel1 from './HomeLevel1.vue';
import Component from './ContributorIM.vue';

const localVue = createLocalVue();

describe('HomeLevel1.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFileTable component', () => {
      wrapper = mount(Component, {
        localVue,
      });
      expect(wrapper.findComponent(HomeLevel1)).toBeTruthy();
    });
  });
});
