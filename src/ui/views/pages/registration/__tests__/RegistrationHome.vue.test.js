import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { mockEventsData } from '@/entities/event';
import { EEventStatus } from '@/types';

import Component from '../home/RegistrationHome.vue';

const localVue = createLocalVue();
const mockEventData = mockEventsData()[0];

const individualTab = {
  id: 'individual',
  active: true,
  svg: {
    transform1: 'translate(-682.000000, -307.000000)',
    transform2: 'translate(328.000000, 164.000000)',
    // eslint-disable-next-line max-len
    d: 'M151,28 C173.09139,28 191,45.90861 191,68 C191,90.09139 173.09139,108 151,108 C128.90861,108 111,90.09139 111,68 C111,45.90861 128.90861,28 151,28 Z M151,29 C129.460895,29 112,46.4608948 112,68 C112,89.5391052 129.460895,107 151,107 C172.539105,107 190,89.5391052 190,68 C190,46.4608948 172.539105,29 151,29 Z M169,66 C174.522847,66 179,70.4771525 179,76 L179,88 L149,88 L149,76 C149,70.4771525 153.477153,66 159,66 L169,66 Z M169,68 L159,68 C154.581722,68 151,71.581722 151,76 L151,86 L177,86 L177,76 C177,71.581722 173.418278,68 169,68 Z M135,71 C139.418278,71 143,74.581722 143,79 L143,85 L121,85 L121,79 C121,74.581722 124.581722,71 129,71 L135,71 Z M135,73 L129,73 C125.686292,73 123,75.6862915 123,79 L123,83 L141,83 L141,79 C141,75.6862915 138.313708,73 135,73 Z M132,57 C135.313708,57 138,59.6862915 138,63 C138,66.3137085 135.313708,69 132,69 C128.686292,69 126,66.3137085 126,63 C126,59.6862915 128.686292,57 132,57 Z M132,59 C129.790861,59 128,60.790861 128,63 C128,65.209139 129.790861,67 132,67 C134.209139,67 136,65.209139 136,63 C136,60.790861 134.209139,59 132,59 Z M164,47 C168.418278,47 172,50.581722 172,55 C172,59.418278 168.418278,63 164,63 C159.581722,63 156,59.418278 156,55 C156,50.581722 159.581722,47 164,47 Z M164,49 C160.686292,49 158,51.6862915 158,55 C158,58.3137085 160.686292,61 164,61 C167.313708,61 170,58.3137085 170,55 C170,51.6862915 167.313708,49 164,49 Z',
  },
};

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

    wrapper.vm.individualTab = individualTab;
    wrapper.vm.event = mockEventData;
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page contains a drop-down menu', () => {
        const element = wrapper.find('[data-test="crcRegistrationLandingPage__event"]');
        expect(element.exists()).toBe(true);
      });
      test('The page displays the phone number of the selected event, if the tab type is "individual"', () => {
        const element = wrapper.find('[data-test="registrationLandingPage__phoneNumber"]');
        expect(element.exists()).toBe(true);
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
});
