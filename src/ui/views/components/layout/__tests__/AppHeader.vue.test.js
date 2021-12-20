/**
 * @group ui/components/layout
 */

import Vuetify from 'vuetify';
import { mockStorage } from '@/store/storage';
import { mockBrandingEntity } from '@/entities/branding';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { mockUsersData } from '@/entities/user';
import routes from '@/constants/routes';
import { mockUserStateContributor } from '@/test/helpers';

import Component from '../AppHeader.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AppHeader.vue', () => {
  let wrapper;
  let mutations;

  beforeEach(() => {
    const vuetify = new Vuetify();

    mutations = {
      setProperty: jest.fn(),
    };

    wrapper = mount(Component, {
      localVue,
      vuetify,
      store: {
        modules: {
          dashboard: {
            state: {
              rightMenuVisible: false,
              leftMenuVisible: false,
              leftMenuExpanded: false,
              generalHelpMenuVisible: false,
            },
            mutations,
          },
          user: {
            state: mockUsersData()[0],
          },
        },
      },
      mocks: {
        $route: {
          name: routes.events.home.name,
        },
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('getAvatarName', () => {
      it('should return the user initials', () => {
        expect(wrapper.vm.getAvatarName).toEqual('JW');
      });
    });

    describe('logoUrl', () => {
      it('should return the logoUrl', () => {
        expect(wrapper.vm.logoUrl).toEqual(wrapper.vm.$storage.branding.getters.logoUrl('en'));
      });
    });

    describe('branding', () => {
      it('should return the branding', () => {
        expect(wrapper.vm.branding).toEqual(wrapper.vm.$storage.branding.getters.branding());
      });
    });
  });

  describe('Methods', () => {
    describe('handleLeftMenu', () => {
      it('if device size is medium and up, sets into the store the opposite state of leftMenuVisible', async () => {
        wrapper.vm.$vuetify.breakpoint.mdAndUp = true;
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();

        expect(storage.dashboard.mutations.setProperty).toHaveBeenNthCalledWith(1, { property: 'leftMenuVisible', value: true });

        expect(storage.dashboard.mutations.setProperty).toHaveBeenNthCalledWith(2, { property: 'leftMenuExpanded', value: true });
      });

      it('if device size is not medium and down, does not change leftMenuVisible state in the store', async () => {
        wrapper.vm.$vuetify.breakpoint.mdAndDown = false;
        await wrapper.vm.$nextTick();
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();
        expect(storage.dashboard.mutations.setProperty).not.toHaveBeenCalledWith(expect.anything(), {
          property: 'leftMenuVisible',
          value: true,
        });
      });

      it('sets into the store the opposite state of leftMenuExpanded', async () => {
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();

        expect(storage.dashboard.mutations.setProperty).toHaveBeenNthCalledWith(1, { property: 'leftMenuVisible', value: true });

        expect(storage.dashboard.mutations.setProperty).toHaveBeenNthCalledWith(2, { property: 'leftMenuExpanded', value: true });
      });
    });

    describe('handleRightMenu', () => {
      it('sets into the store the opposite state of rightMenuVisible ', async () => {
        wrapper.vm.handleRightMenu();
        await wrapper.vm.$nextTick();
        expect(storage.dashboard.mutations.setProperty).toHaveBeenCalledWith({
          property: 'rightMenuVisible',
          value: true,
        });
      });
    });

    describe('handleGeneralHelpMenu', () => {
      it('sets into the store the opposite state of generalHelpMenuVisible', async () => {
        wrapper.vm.handleGeneralHelpMenu();
        await wrapper.vm.$nextTick();
        expect(storage.dashboard.mutations.setProperty).toHaveBeenCalledWith({
          property: 'generalHelpMenuVisible',
          value: true,
        });
      });
    });

    describe('routeToRegistration', () => {
      it('redirects to the registration page', async () => {
        wrapper.vm.routeToRegistration();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.registration.home.name });
      });
    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page contains a hamburger menu', () => {
        const hamburger = wrapper.find('[data-test="left-menu-trigger"]');
        expect(hamburger.exists()).toBe(true);
      });

      test('If the user has level 1 and this is not the registration landing page, the page contains a Register beneficiaries button ', () => {
        const button = wrapper.find('[data-test="appHeader__registerBeneficiaries"]');
        expect(button.exists()).toBe(true);
      });

      test('If this is the registration landing page, the page does not contain a Register beneficiaries button ', async () => {
        wrapper.vm.$route.name = routes.registration.home.name;
        await wrapper.vm.$nextTick();
        const button = wrapper.find('[data-test="appHeader__registerBeneficiaries"]');
        expect(button.exists()).toBe(false);
      });

      test('If the user does not have level 1, the page does not contain a Register beneficiaries button ', () => {
        const wrapper = mount(Component, {
          localVue: createLocalVue(),
          store: {
            ...mockUserStateContributor(1),
          },
          computed: {
            branding() {
              return mockBrandingEntity();
            },
          },
        });
        const button = wrapper.find('[data-test="appHeader__registerBeneficiaries"]');
        expect(button.exists()).toBe(false);
      });

      test('The page contains an en/fr language icon', () => {
        const icon = wrapper.find('[data-test="appHeader__changeLanguage"]');
        expect(icon.exists()).toBe(true);
      });

      test('The page does not contain a help icon', () => {
        const icon = wrapper.find('[data-test="general-help-trigger"]');
        expect(icon.exists()).toBe(false);
      });

      test('The page contains an account settings button', () => {
        const button = wrapper.find('[data-test="right-menu-trigger"]');
        expect(button.exists()).toBe(true);
      });

      test('The logo is displayed correctly', async () => {
        const element = wrapper.find('[data-test="appHeader__logo"]');
        expect(element.classes('logo')).toBeTruthy();
      });
    });

    describe('Event handlers', () => {
      test('Clicking on the hamburger icon calls handleLeftMenu', async () => {
        const hamburger = wrapper.find('[data-test="left-menu-trigger"]');
        jest.spyOn(wrapper.vm, 'handleLeftMenu').mockImplementation(() => {});
        await hamburger.trigger('click');
        expect(wrapper.vm.handleLeftMenu).toBeCalledTimes(1);
      });

      // test('Clicking on the help icon calls handleGeneralHelpMenu', async () => {
      //   const icon = wrapper.find('[data-test="general-help-trigger"]');
      //   jest.spyOn(wrapper.vm, 'handleGeneralHelpMenu').mockImplementation(() => {});
      //   await icon.trigger('click');
      //   expect(wrapper.vm.handleGeneralHelpMenu).toBeCalledTimes(1);
      // });

      test('Clicking on the account icon calls handleRightMenu', async () => {
        const icon = wrapper.find('[data-test="right-menu-trigger"]');
        jest.spyOn(wrapper.vm, 'handleRightMenu').mockImplementation(() => {});
        await icon.trigger('click');
        expect(wrapper.vm.handleRightMenu).toBeCalledTimes(1);
      });

      test('Clicking on the Register Beneficiaries button calls routeToRegistration', async () => {
        const button = wrapper.find('[data-test="appHeader__registerBeneficiaries"]');
        jest.spyOn(wrapper.vm, 'routeToRegistration').mockImplementation(() => {});
        await button.trigger('click');
        expect(wrapper.vm.routeToRegistration).toBeCalledTimes(1);
      });
    });
  });
});
