import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { EEventStatus, mockEventsData } from '@/entities/event';

import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import Component from './RegistrationHome.vue';

const localVue = createLocalVue();
const mockEventData = mockEventsData()[0];

const storage = mockStorage();

const actions = {
  searchEvents: jest.fn(),
};
const vuetify = new Vuetify();

describe('RegistrationHome.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
      vuetify,
      store: {
        modules: {
          event: {
            actions,
          },
        },
      },
      mocks: {
        $storage: storage,
      },
    });

    await wrapper.setData({
      event: mockEventData,
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
    test('Events should be fetched with the right filter', () => {
      expect(actions.searchEvents).toHaveBeenCalledWith(expect.anything(), {
        filter: { Schedule: { Status: EEventStatus.Open } },
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
        wrapper.vm.setEvent(mockEventData);
        expect(wrapper.vm.$storage.registration.mutations.setEvent).toHaveBeenCalledWith({
          eventId: mockEventData.id,
          eventName: mockEventData.name,
          responseDetails: mockEventData.responseDetails,
          registrationLink: mockEventData.registrationLink,
          tenantId: mockEventData.tenantId,
          shelterLocations: mockEventData.shelterLocations,
        });
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
        expect(wrapper.vm.assistanceNumber).toBe(mockEventData.responseDetails.assistanceNumber);
      });
    });
  });
});
