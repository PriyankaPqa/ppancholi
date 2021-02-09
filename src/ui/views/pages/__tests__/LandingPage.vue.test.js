import flushPromises from 'flush-promises';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockEventsData } from '@/entities/event';
import Component from '../LandingPage.vue';

const localVue = createLocalVue();

describe('LandingPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
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

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The title is displayed correctly', async () => {
        const element = wrapper.find('[data-test="registration-title"]');
        expect(element.text()).toBe('registration.landingpage.welcome_self');
      });

      test('The start registration button is displayed correctly', async () => {
        const element = wrapper.find('[data-test="startRegistration-individual-button"]');
        expect(element.exists()).toBe(true);
      });
    });

    describe('Event handlers', () => {
      test('Click the start registration button redirect to individual registration page', async () => {
        const btn = wrapper.find('[data-test="startRegistration-individual-button"]');
        btn.trigger('click');
        await flushPromises();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.individual.name });
      });

      test('The start registration phone number is displayed correctly', async () => {
        const element = wrapper.find('[data-test="registration__phoneNumber"]');
        expect(element.exists()).toBe(true);
      });
    });
  });
});
