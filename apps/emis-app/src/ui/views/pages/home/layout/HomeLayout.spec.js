import { createLocalVue, mount } from '@/test/testSetup';

import { createTestingPinia } from '@pinia/testing';

import { useUserStore } from '@/pinia/user/user';
import Component from './HomeLayout.vue';

const localVue = createLocalVue();

let wrapper;
const doMount = () => {
  const pinia = createTestingPinia({ stubActions: false });
  const userStore = useUserStore(pinia);
  userStore.getLandingPage = jest.fn().mockImplementation(() => 'HomeLevel4');

  wrapper = mount(Component, {
    localVue,
    pinia,
  });
};

describe('HomeLayout.vue', () => {
  describe('Computed', () => {
    doMount();
    describe('component', () => {
      it('is linked to getLandingPage', () => {
        expect(wrapper.vm.component).toBe('HomeLevel4');
      });
    });

    describe('metaTitle', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaTitle).toBe('metaInfo.dashboard_home.title');
      });
    });

    describe('metaDescription', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.metaDescription).toBe('metaInfo.dashboard_home.description');
      });
    });
  });
});
