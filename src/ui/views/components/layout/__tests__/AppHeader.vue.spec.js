import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockEventsData } from '@crctech/registration-lib/src/entities/event';
import Component from '../AppHeader.vue';

const localVue = createLocalVue();

describe('AppHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      store: {
        modules: {
          registration: {
            state: {
              event: mockEventsData()[0],
            },
          },
        },
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

  test('The help link is displayed', async () => {
    const icon = wrapper.find('[data-test="general-help-trigger"]');
    expect(icon.exists()).toBe(true);
  });
});
