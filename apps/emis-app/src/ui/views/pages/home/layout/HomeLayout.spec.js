import { createLocalVue, mount } from '@/test/testSetup';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { mockProvider } from '@/services/provider';
import Component from './HomeLayout.vue';

const localVue = createLocalVue();
const services = mockProvider();

let wrapper;
const doMount = () => {
  const { pinia } = useMockUserStore();

  wrapper = mount(Component, {
    localVue,
    pinia,
    mocks: {
      $services: services,
    },
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
