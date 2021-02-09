import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { mockEventsData } from '@/entities/event';
import { EEventStatus } from '@/types';

import Component from './RegistrationHome.vue';

const localVue = createLocalVue();
const mockEventData = mockEventsData()[0];

describe('RegistrationHome.vue', () => {
  let wrapper;
  let actions;

  beforeEach(() => {
    const vuetify = new Vuetify();

    actions = {
      searchEvents: jest.fn(),
    };

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
    });

    wrapper.vm.event = mockEventData;
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
});
