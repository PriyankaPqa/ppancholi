import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { mockUsersData } from '@/entities/user';

import Component from '../AppHeader.vue';

const localVue = createLocalVue();

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
    });
  });

  describe('Computed', () => {
    describe('getAvatarName', () => {
      it('should return the user initials', () => {
        expect(wrapper.vm.getAvatarName).toEqual('JW');
      });
    });
  });

  describe('Methods', () => {
    describe('handleLeftMenu', () => {
      it('if device size is medium and up, sets into the store the opposite state of leftMenuVisible', async () => {
        wrapper.vm.$vuetify.breakpoint.mdAndUp = true;
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();
        expect(mutations.setProperty).toHaveBeenCalledWith(expect.anything(), {
          property: 'leftMenuVisible',
          value: true,
        });
      });

      it('if device size is not medium and down, does not change leftMenuVisible state in the store', async () => {
        wrapper.vm.$vuetify.breakpoint.mdAndDown = false;
        await wrapper.vm.$nextTick();
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();
        expect(mutations.setProperty).not.toHaveBeenCalledWith(expect.anything(), {
          property: 'leftMenuVisible',
          value: true,
        });
      });

      it('sets into the store the opposite state of leftMenuExpanded', async () => {
        wrapper.vm.handleLeftMenu();
        await wrapper.vm.$nextTick();
        expect(mutations.setProperty).toHaveBeenCalledWith(expect.anything(), {
          property: 'leftMenuExpanded',
          value: true,
        });
      });
    });

    describe('handleRightMenu', () => {
      it('sets into the store the opposite state of rightMenuVisible ', async () => {
        wrapper.vm.handleRightMenu();
        await wrapper.vm.$nextTick();
        expect(mutations.setProperty).toHaveBeenCalledWith(expect.anything(), {
          property: 'rightMenuVisible',
          value: true,
        });
      });
    });

    describe('handleGeneralHelpMenu', () => {
      it('sets into the store the opposite state of generalHelpMenuVisible ', async () => {
        wrapper.vm.handleGeneralHelpMenu();
        await wrapper.vm.$nextTick();
        expect(mutations.setProperty).toHaveBeenCalledWith(expect.anything(), {
          property: 'generalHelpMenuVisible',
          value: true,
        });
      });
    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page contains a hamburger menu', () => {
        const hamburger = wrapper.find('[data-test="left-menu-trigger"]');
        expect(hamburger.exists()).toBe(true);
      });

      test('The page contains a Register beneficiaries button', () => {
        const button = wrapper.find('[data-test="appHeader__registerBeneficiaries"]');
        expect(button.exists()).toBe(true);
      });

      test('The page contains an en/fr language icon', () => {
        const icon = wrapper.find('[data-test="appHeader__changeLanguage"]');
        expect(icon.exists()).toBe(true);
      });

      test('The page contains a help icon', () => {
        const icon = wrapper.find('[data-test="general-help-trigger"]');
        expect(icon.exists()).toBe(true);
      });

      test('The page contains an account settings button', () => {
        const button = wrapper.find('[data-test="right-menu-trigger"]');
        expect(button.exists()).toBe(true);
      });

      test('The logo is displayed correctly by changing the system language', async () => {
        const element = wrapper.find('[data-test="appHeader__logo"]');
        expect(element.classes('logoEn')).toBeTruthy();

        wrapper.vm.$i18n.locale = 'fr';
        await wrapper.vm.$nextTick();

        expect(element.classes('logoFr')).toBeTruthy();
      });
    });

    describe('Event handlers', () => {
      test('Clicking on the hamburger icon calls handleLeftMenu', async () => {
        const hamburger = wrapper.find('[data-test="left-menu-trigger"]');
        jest.spyOn(wrapper.vm, 'handleLeftMenu').mockImplementation(() => {});
        await hamburger.trigger('click');
        expect(wrapper.vm.handleLeftMenu).toBeCalledTimes(1);
      });

      test('Clicking on the help icon calls handleGeneralHelpMenu', async () => {
        const icon = wrapper.find('[data-test="general-help-trigger"]');
        jest.spyOn(wrapper.vm, 'handleGeneralHelpMenu').mockImplementation(() => {});
        await icon.trigger('click');
        expect(wrapper.vm.handleGeneralHelpMenu).toBeCalledTimes(1);
      });

      test('Clicking on the account icon calls handleRightMenu', async () => {
        const icon = wrapper.find('[data-test="right-menu-trigger"]');
        jest.spyOn(wrapper.vm, 'handleRightMenu').mockImplementation(() => {});
        await icon.trigger('click');
        expect(wrapper.vm.handleRightMenu).toBeCalledTimes(1);
      });
    });
  });
});
