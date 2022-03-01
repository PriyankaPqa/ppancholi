/**
 * @group ui/components/registration
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import Component from '../LeftMenu.vue';

const localVue = createLocalVue();

describe('LeftMenu.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('isLeftMenuOpen', () => {
      it('returns true if the left menu is open, false otherwise', () => {
        wrapper.vm.$storage.registration.mutations.toggleLeftMenu(true);
        expect(wrapper.vm.isLeftMenuOpen).toBeTruthy();

        wrapper.vm.$storage.registration.mutations.toggleLeftMenu(false);
        expect(wrapper.vm.isLeftMenuOpen).toBeFalsy();
      });
    });
    describe('tabs', () => {
      it('returns tabs in store', () => {
        expect(wrapper.vm.tabs).toEqual(wrapper.vm.$storage.registration.getters.tabs());
      });
    });
    describe('currentTab', () => {
      it('returns current tab in store', () => {
        expect(wrapper.vm.currentTab).toEqual(wrapper.vm.$storage.registration.getters.currentTab());
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
      });
    });
    describe('Event handlers', () => {
      test('Click tab emits event', async () => {
        const btn = wrapper.find('[data-test="registration-tab-personalInfo"]');
        await btn.trigger('click');

        expect(wrapper.emitted('jump')[0][0]).toBe(1);
      });
    });
  });
});
