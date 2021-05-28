import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from '../AppHeader.vue';

const localVue = createLocalVue();

describe('AppHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: mockStorage(),
      },
    });
  });

  test('The logo is displayed correctly by changing the system language', async () => {
    const element = wrapper.find('[data-test="registration-portal-logo"]');
    expect(element.classes('logoEn')).toBeTruthy();

    wrapper.vm.$i18n.locale = 'fr';

    await wrapper.vm.$nextTick();

    expect(element.classes('logoFr')).toBeTruthy();
  });

  test('The event name is displayed correctly', async () => {
    const element = wrapper.find('[data-test="registration-portal-toolbar-event-name"]');
    expect(element.exists()).toBe(true);
  });

  test('The language selector is displayed', async () => {
    const element = wrapper.find('[data-test="registration-portal-language-selector"]');
    expect(element.exists()).toBe(true);
  });

  describe('Help link', () => {
    it('should be displayed', async () => {
      const icon = wrapper.find('[data-test="general-help-trigger"]');
      expect(icon.exists()).toBe(true);
    });

    it('is linked to the correct key', async () => {
      expect(wrapper.vm.helpLink).toBe('zendesk.beneficiary_registration.introduction');
    });

    it('should trigger openHelp method', async () => {
      wrapper.vm.openHelp = jest.fn();
      const icon = wrapper.find('[data-test="general-help-trigger"]');
      icon.vm.$emit('click');
      expect(wrapper.vm.openHelp).toHaveBeenCalledTimes(1);
    });
  });
});
