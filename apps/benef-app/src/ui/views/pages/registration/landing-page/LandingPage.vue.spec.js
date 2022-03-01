/**
 * @group ui/components/registration
 */

import { mockEvent } from '@libs/registration-lib/entities/event';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import Component from './LandingPage.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('LandingPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
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
        await btn.trigger('click');
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.individual.name });
      });

      test('The start registration phone number is displayed correctly', async () => {
        const element = wrapper.find('[data-test="registration__phoneNumber"]');
        expect(element.exists()).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    describe('phoneNumber', () => {
      it('should return the phone number of the event', () => {
        expect(wrapper.vm.phoneNumber).toEqual(mockEvent().responseDetails.assistanceNumber);
      });
    });

    describe('event', () => {
      it('should return the event from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEvent());
      });
    });
  });

  describe('Methods', () => {
    describe('redirect', () => {
      it('should redirect to home page of registration', () => {
        wrapper.vm.redirect();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.individual.name });
      });
    });
  });
});
