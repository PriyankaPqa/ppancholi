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

      await wrapper.setRole('level6');
    });

    describe('Option lists card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('sysManagementHome__lists');
        expect(card.exists()).toBeTruthy();
      });
    });

    describe('Roles card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('sysManagementHome__roles');
        expect(card.exists()).toBeTruthy();
      });
    });

    describe('User account card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('sysManagementHome__accounts');
        expect(card.exists()).toBeTruthy();
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

    describe('Branding card', () => {
      it('has the correct title', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__branding');
        expect(card.title).toBe('system_management.card.branding.title');
      });

      it('has the correct description', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__branding');
        expect(card.description).toBe('system_management.card.branding.description');
      });

      it('has the correct button label', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'sysManagementHome__branding');
        expect(card.button).toBe('system_management.card.branding.btn.label');
      });
    });
  });
});
