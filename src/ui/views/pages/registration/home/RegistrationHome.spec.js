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
      it('should call fetchActiveEvents', () => {
        jest.spyOn(wrapper.vm, 'fetchActiveEvents');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchActiveEvents).toHaveBeenCalledTimes(1);
      });

      it('should call resetBeneficiaryModule', () => {
        jest.spyOn(wrapper.vm, 'resetBeneficiaryModule');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.resetBeneficiaryModule).toHaveBeenCalledTimes(1);
      });

      it('should call resetRegistrationModule', () => {
        jest.spyOn(wrapper.vm, 'resetRegistrationModule');
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.resetRegistrationModule).toHaveBeenCalledTimes(1);
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

    describe('resetBeneficiaryModule', () => {
      it('should call resetState from beneficiary storage', () => {
        jest.clearAllMocks();
        wrapper.vm.resetBeneficiaryModule();
        expect(wrapper.vm.$storage.beneficiary.mutations.resetState).toHaveBeenCalledWith();
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
