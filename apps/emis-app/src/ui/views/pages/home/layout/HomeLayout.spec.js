import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import DashboardCaseFile from '@/ui/views/pages/home/components/DashboardCaseFile.vue';
import HomeLevel3 from '@/ui/views/pages/home/components/HomeLevel3.vue';
import HomeLevel4 from '@/ui/views/pages/home/components/HomeLevel4.vue';
import HomeLevel5 from '@/ui/views/pages/home/components/HomeLevel5.vue';
import HomeLevel6 from '@/ui/views/pages/home/components/HomeLevel6.vue';
import HomeNoRole from '@/ui/views/pages/home/components/HomeNoRole.vue';
import { User, mockUsersData } from '@libs/entities-lib/user';
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

    it('shows DashboardCaseFile component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('DashboardCaseFile');
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(DashboardCaseFile)).toBeTruthy();
    });

    it('shows HomeNoRole component', () => {
      storage.user.getters.landingPage.mockReturnValueOnce('HomeNoRole');
      storage.user.getters.user.mockReturnValueOnce(new User({ ...mockUsersData()[10] }));
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
      expect(wrapper.findComponent(HomeNoRole)).toBeTruthy();
    });
  });
});
