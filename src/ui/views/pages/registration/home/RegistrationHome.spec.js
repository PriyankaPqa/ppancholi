import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { EEventStatus, mockEventsSearchData } from '@/entities/event';

import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import Component from './RegistrationHome.vue';

const localVue = createLocalVue();
const mockEvent = mockEventsSearchData()[0];

const storage = mockStorage();

const vuetify = new Vuetify();

describe('RegistrationHome.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      vuetify,
      mocks: {
        $storage: storage,
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
      it('should call fetchActiveEvents', async () => {
        wrapper.vm.fetchActiveEvents = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchActiveEvents).toHaveBeenCalledTimes(1);
      });

      it('should call resetHouseholdModule', () => {
        jest.spyOn(wrapper.vm, 'resetHouseholdModule');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.resetHouseholdModule).toHaveBeenCalledTimes(1);
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
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.registration.individual.name });
      });
    });

    describe('setEvent', () => {
      it('should call setEvent mutations with proper params', () => {
        wrapper.vm.setEvent(mockEvent);
        expect(wrapper.vm.$storage.registration.mutations.setEvent).toHaveBeenCalledWith({
          eventId: mockEvent.eventId,
          eventName: mockEvent.eventName,
          responseDetails: mockEvent.responseDetails,
          registrationLink: mockEvent.registrationLink,
          tenantId: mockEvent.tenantId,
          shelterLocations: mockEvent.shelterLocations,
          registrationLocations: mockEvent.registrationLocations,
        });
      });
    });

    describe('fetchActiveEvents', () => {
      it('should fetch the proper events', () => {
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Schedule: { Status: EEventStatus.Open } },
        });
      });
    });

    describe('resetRegistrationModule', () => {
      it('should call resetState from registration storage', () => {
        wrapper.vm.resetRegistrationModule();
        expect(wrapper.vm.$storage.registration.mutations.resetState).toHaveBeenCalledWith(tabs());
      });
    });

    describe('resetHouseholdModule', () => {
      it('should call resetState from beneficiary storage', () => {
        jest.clearAllMocks();
        wrapper.vm.resetHouseholdModule();
        expect(wrapper.vm.$storage.household.mutations.resetState).toHaveBeenCalledWith();
      });
    });

    describe('fetchDataForRegistration', () => {
      it('should fetch genders', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchGenders).toHaveBeenCalledTimes(1);
      });

      it('should fetch fetchPreferredLanguages', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('should fetch fetchPrimarySpokenLanguages', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
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
