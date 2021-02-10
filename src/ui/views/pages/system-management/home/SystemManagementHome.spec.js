import {
  createLocalVue,
  shallowMount,
  mount,
} from '@/test/testSetup';
import Component from './SystemManagementHome.vue';

const localVue = createLocalVue();

describe('SystemManagementHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        localVue,
      });
    });

    describe('Option lists card', () => {
      it('is displayed', async () => {
        const card = wrapper.find('[data-test="sysManagementHome__lists"]');
        expect(card.exists()).toBeTruthy();
      });

      it('calls goTo when clicking the button with correct params', async () => {
        jest.spyOn(wrapper.vm, 'goTo');
        await wrapper.find('[data-test="sysManagementHome__lists__button"]').trigger('click');
        expect(wrapper.vm.goTo).toHaveBeenCalledWith('');
      });
    });

    describe('Roles card', () => {
      it('is displayed', async () => {
        const card = wrapper.find('[data-test="sysManagementHome__roles"]');
        expect(card.exists()).toBeTruthy();
      });

      it('calls goTo when clicking the button with correct params', async () => {
        jest.spyOn(wrapper.vm, 'goTo');
        await wrapper.find('[data-test="sysManagementHome__roles__button"]').trigger('click');
        expect(wrapper.vm.goTo).toHaveBeenCalledWith('');
      });
    });

    describe('User account card', () => {
      it('is displayed', async () => {
        const card = wrapper.find('[data-test="sysManagementHome__accounts"]');
        expect(card.exists()).toBeTruthy();
      });

      it('calls goTo when clicking the button with correct params', async () => {
        jest.spyOn(wrapper.vm, 'goTo');
        await wrapper.find('[data-test="sysManagementHome__accounts__button"]').trigger('click');
        expect(wrapper.vm.goTo).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('Option lists card', () => {
      it('has the correct title', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__lists');
        expect(card.title).toBe('system_management.card.lists_title');
      });

      it('has the correct description', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__lists');
        expect(card.description).toBe('system_management.card.lists_description');
      });

      it('has the correct button label', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__lists');
        expect(card.button).toBe('system_management.card.btn.lists_title');
      });
    });

    describe('Roles card', () => {
      it('has the correct title', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__roles');
        expect(card.title).toBe('system_management.card.roles_title');
      });

      it('has the correct description', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__roles');
        expect(card.description).toBe('system_management.card.roles_description');
      });

      it('has the correct button label', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__roles');
        expect(card.button).toBe('system_management.card.btn.roles_title');
      });
    });

    describe('User accounts card', () => {
      it('has the correct title', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__accounts');
        expect(card.title).toBe('system_management.card.user_accounts_title');
      });

      it('has the correct description', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__accounts');
        expect(card.description).toBe('system_management.card.user_accounts_description');
      });

      it('has the correct button label', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__accounts');
        expect(card.button).toBe('system_management.card.btn.user_accounts_title');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('goTo', () => {
      it('redirects to the correct route', () => {
        wrapper.vm.goTo('routeTest');
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'routeTest' });
      });
    });
  });
});
