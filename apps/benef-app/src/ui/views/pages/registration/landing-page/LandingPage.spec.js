import { mockEventSummary } from '@libs/entities-lib/event';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockProvider } from '@/services/provider';
import Component from './LandingPage.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, registrationStore } = useMockRegistrationStore();
describe('LandingPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      mocks: {
        $services: services,
      },
    });
  });

  describe('Template', () => {
    describe('Elements on page ', () => {
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
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.individual.name });
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
        expect(wrapper.vm.phoneNumber).toEqual(mockEventSummary().responseDetails.assistanceNumber);
      });
    });

    describe('event', () => {
      it('should return the event from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEventSummary());
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call reset', () => {
        wrapper.vm.reset = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(wrapper.vm.reset).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('redirect', () => {
      it('should redirect to home page of registration', () => {
        registrationStore.setTimeOnStep = jest.fn();
        wrapper.vm.redirect();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.individual.name });
        expect(registrationStore.setTimeOnStep).toHaveBeenCalledWith('LandingPage');
      });
    });
    describe('reset', () => {
      it('should reset household, tabs, token and privacy check', () => {
        wrapper.vm.$registrationStore.isPrivacyAgreed = true;
        wrapper.vm.reset();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalled();
        expect(registrationStore.resetTabs).toHaveBeenCalled();
        expect(wrapper.vm.$services.publicApi.resetPublicToken).toHaveBeenCalled();
        expect(wrapper.vm.$registrationStore.isPrivacyAgreed).toBe(false);
      });
    });
  });
});
