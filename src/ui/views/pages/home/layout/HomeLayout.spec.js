import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import HomeLevel1 from '@/ui/views/pages/home/components/HomeLevel1.vue';
import HomeLevel2 from '@/ui/views/pages/home/components/HomeLevel2.vue';
import HomeLevel3 from '@/ui/views/pages/home/components/HomeLevel3.vue';
import HomeLevel4 from '@/ui/views/pages/home/components/HomeLevel4.vue';
import HomeLevel5 from '@/ui/views/pages/home/components/HomeLevel5.vue';
import HomeLevel6 from '@/ui/views/pages/home/components/HomeLevel6.vue';
import ContributorIM from '@/ui/views/pages/home/components/ContributorIM.vue';
import Component from './HomeLayout.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HomeLayout.vue', () => {
  let wrapper;

  describe('Computed', () => {
    storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel6');
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
    describe('component', () => {
      it('should return the getter landingPage', () => {
        expect(wrapper.vm.component).toBe('HomeLevel6');
      });
    });
  });

  describe('Template', () => {
    it('shows HomeLevel6 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel6');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel6)).toBeTruthy();
    });

    it('shows HomeLevel5 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel5');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel5)).toBeTruthy();
    });

    it('shows HomeLevel4 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel4');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel4)).toBeTruthy();
    });

    it('shows HomeLevel3 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel3');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel3)).toBeTruthy();
    });

    it('shows HomeLevel2 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel2');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel2)).toBeTruthy();
    });

    it('shows HomeLevel1 component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeLevel1');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeLevel1)).toBeTruthy();
    });

    it('shows ContributorIM component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('ContributorIM');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(ContributorIM)).toBeTruthy();
    });
  });
});
