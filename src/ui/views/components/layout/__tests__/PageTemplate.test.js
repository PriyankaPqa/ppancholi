import { createLocalVue, mount } from '@/test/testSetup';
import { RcPageLoading } from '@crctech/component-library';
import SecondaryLeftMenu from '@/ui/views/components/layout/SecondaryLeftMenu.vue';
import SecondaryRightMenu from '@/ui/views/components/layout/SecondaryRightMenu.vue';

import Component from '../PageTemplate.vue';

describe('PageTemplate.vue', () => {
  let wrapper;
  const localVue = createLocalVue();
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $t: () => 'test',
      },
      propsData: {
        leftMenuTitle: 'titleLeftMenu',
        navigationTabs: [
          {
            text: 'menu1',
            test: 'test1',
            icon: '',
            disabled: false,
            to: 'route1',
          },
          {
            text: 'menu2',
            test: 'test2',
            icon: 'mdi-calendar',
            disabled: true,
            to: 'route2',
          },
        ],
        loading: false,
      },
      slots: {
        'left-menu': '<div data-test="left-menu-slot"></div>',
        'page-right-menu-top': '<div data-test="right-menu-top-slot"></div>',
        'page-right-menu-default': '<div data-test="right-menu-default-slot"></div>',
      },
      data() {
        return {
          comingFromOutside: false,
        };
      },
    });
  });

  describe('Navigation menu', () => {
    test('name is displayed', () => {
      const text = wrapper.find('[data-test="test1"]').find('[data-test="item-text-0"]');
      expect(text.text()).toBe('menu1');
    });
    test('data-test is set', () => {
      expect(wrapper.find('[data-test="test1"]').exists()).toBe(true);
    });
    test('icon is shown or not', () => {
      const icon = wrapper.find('[data-test="test1"]').find('[data-test="item-icon"]');
      expect(icon.exists()).toBe(false);
      const icon2 = wrapper.find('[data-test="test2"]').find('[data-test="item-icon"]');
      expect(icon2.exists()).toBe(true);
    });
    test('item is disabled or not', () => {
      const item = wrapper.find('[data-test="test1"]');
      expect(item.attributes('aria-disabled')).toBeFalsy();
      const item2 = wrapper.find('[data-test="test2"]');
      expect(item2.attributes('aria-disabled')).toBe('true');
    });
  });
  // describe('Methods', () => {
  //   test('Back redirect to the n-1 as the default behaviour', async () => {
  //     await wrapper.find('[data-test="back-button"]').trigger('click');
  //     expect(wrapper.vm.$router.go).toHaveBeenCalledWith(-1);
  //   });
  //   test('Back redirect to events list if current page is event detail summary', async () => {
  //     wrapper.vm.$route.name = routes.eventDetailSummary.name;
  //     await wrapper.find('[data-test="back-button"]').trigger('click');
  //     expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.events.name });
  //   });
  //   test('Back redirect to teams list if current page is team detail', async () => {
  //     wrapper.vm.$route.name = routes.teams_detail.name;
  //     await wrapper.find('[data-test="back-button"]').trigger('click');
  //     expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.teams.name });
  //   });
  //   describe('Coming from outside', () => {
  //     test('Back redirect to dashboard home if coming from outside unless current page is the beneficiary edit profile', async () => {
  //       global.storage = {
  //         store: {},
  //         getItem: (key) => this.store[key],
  //         // eslint-disable-next-line no-return-assign
  //         setItem: (key, value) => this.store[key] = value,
  //       };
  //       global.localStorage.setItem('fromOutside', 'true');
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.home.name });
  //     });
  //     test('Back redirect to casefile home if coming from outside and current page is the beneficiary edit profile', async () => {
  //       global.storage = {
  //         store: {},
  //         getItem: (key) => this.store[key],
  //         // eslint-disable-next-line no-return-assign
  //         setItem: (key, value) => this.store[key] = value,
  //       };
  //       global.localStorage.setItem('fromOutside', 'true');
  //       wrapper.vm.$route.name = routes.beneficiaryProfileEdit.name;
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.caseFiles.name });
  //     });
  //     test('back redirects to system management if route is lists', async () => {
  //       wrapper.vm.$route.name = routes.system_management_lists.name;
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.system_management.name });
  //     });
  //     test('back redirects to system management if route is accounts', async () => {
  //       wrapper.vm.$route.name = routes.system_management_user_accounts.name;
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.system_management.name });
  //     });
  //     test('back redirects to system management if route is languages', async () => {
  //       wrapper.vm.$route.name = routes.system_management_supported_languages.name;
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.system_management.name });
  //     });
  //     test('back redirects to system management if route is roles', async () => {
  //       wrapper.vm.$route.name = routes.system_management_roles.name;
  //       await wrapper.find('[data-test="back-button"]').trigger('click');
  //       expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.system_management.name });
  //     });
  //   });
  // });
  describe('Props', () => {
    test('showRightMenu', async () => {
      expect(wrapper.findComponent(SecondaryRightMenu).exists()).toBe(false);
      wrapper.setProps({
        showRightMenu: true,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(SecondaryRightMenu).exists()).toBe(true);
    });
    test('showLeftMenu', async () => {
      expect(wrapper.findComponent(SecondaryLeftMenu).exists()).toBe(true);
      wrapper.setProps({
        showLeftMenu: false,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(SecondaryLeftMenu).exists()).toBe(false);
    });
    test('loading', async () => {
      expect(wrapper.findComponent(RcPageLoading).exists()).toBe(false);
      wrapper.setProps({
        loading: true,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(RcPageLoading).exists()).toBe(true);
    });
  });
  describe('Slots', () => {
    test('left-menu is correctly displayed', () => {
      const slot = wrapper.find('[data-test="left-menu-slot"]');
      expect(slot.exists()).toBe(true);
    });
    test('right-menu-top is correctly displayed', async () => {
      wrapper.setProps({
        showRightMenu: true,
      });
      await wrapper.vm.$nextTick();
      const slot = wrapper.find('[data-test="right-menu-top-slot"]');
      expect(slot.exists()).toBe(true);
    });
    test('right-menu-default is correctly displayed', async () => {
      wrapper.setProps({
        showRightMenu: true,
      });
      await wrapper.vm.$nextTick();
      const slot = wrapper.find('[data-test="right-menu-default-slot"]');
      expect(slot.exists()).toBe(true);
    });
  });
});
