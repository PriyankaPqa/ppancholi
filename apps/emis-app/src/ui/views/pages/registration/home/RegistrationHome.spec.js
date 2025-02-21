import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import routes from '@/constants/routes';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { tabs } from '@/pinia/registration/tabs';
import { createTestingPinia } from '@pinia/testing';
import resetStore from '@libs/stores-lib/store-reset';

import { mockProvider } from '@/services/provider';
import Component from './RegistrationHome.vue';

const localVue = createLocalVue();
const services = mockProvider();
const mockEvent = mockEventEntity();

const vuetify = new Vuetify();

const pinia = createTestingPinia({
  stubActions: false,
  plugins: [resetStore],
});

const { registrationStore } = useMockRegistrationStore(pinia);
describe('RegistrationHome.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
      vuetify,
      mocks: {
        $services: services,
      },
    });

    await wrapper.setData({
      event: mockEvent,
    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page contains a drop-down menu', () => {
        const element = wrapper.find('[data-test="crcRegistrationLandingPage__event"]');
        expect(element.exists()).toBe(true);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('should call resetHouseholdCreate', () => {
        jest.spyOn(wrapper.vm, 'resetHouseholdCreate');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });

      it('should call resetRegistrationModule', () => {
        jest.spyOn(wrapper.vm, 'resetRegistrationModule');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.resetRegistrationModule).toHaveBeenCalledTimes(1);
      });

      it('should call fetchDataForRegistration', async () => {
        wrapper.vm.fetchDataForRegistration = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchDataForRegistration).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('redirect', () => {
      it('should redirect to individual registration', () => {
        wrapper.vm.redirect();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.registration.individual.name });
      });
    });

    describe('setEvent', () => {
      it('should set the event', async () => {
        await wrapper.vm.setEvent(mockEvent);
        expect(registrationStore.event).toEqual(mockEvent);
      });

      it('should call setAssessmentToComplete mutations with proper params', async () => {
        await wrapper.vm.setEvent(mockEvent);
        expect(wrapper.vm.$services.assessmentForms.get).toHaveBeenCalledWith({ id: mockEvent.registrationAssessments[0].assessmentId });
        expect(registrationStore.setAssessmentToComplete).toHaveBeenCalledWith({
          assessmentForm: wrapper.vm.$services.assessmentForms.get(),
          registrationAssessment: mockEvent.registrationAssessments[0],
        });
      });
    });

    describe('resetRegistrationModule', () => {
      it('should reset the store and set tabs', () => {
        wrapper.vm.resetRegistrationModule();
        expect(registrationStore.tabs).toEqual(tabs());
      });
    });

    describe('resetHouseholdCreate', () => {
      it('should call resetState from beneficiary storage', () => {
        jest.clearAllMocks();
        wrapper.vm.resetHouseholdCreate();
        expect(registrationStore.resetHouseholdCreate).toBeCalled();
      });
    });

    describe('fetchDataForRegistration', () => {
      it('should fetch genders', () => {
        expect(registrationStore.fetchGenders).toHaveBeenCalledTimes(1);
      });

      it('should fetch fetchPreferredLanguages', () => {
        expect(registrationStore.fetchPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('should fetch fetchPrimarySpokenLanguages', () => {
        expect(registrationStore.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('canRegister', () => {
      it('should return true if event is defined', () => {
        expect(wrapper.vm.canRegister).toBeTruthy();
      });
    });

    describe('assistanceNumber', () => {
      it('should return the phone number of the selected event', async () => {
        expect(wrapper.vm.assistanceNumber).toBe(mockEvent.responseDetails.assistanceNumber);
      });
    });
  });
});
