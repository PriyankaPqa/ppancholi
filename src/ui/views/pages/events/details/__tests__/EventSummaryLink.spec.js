import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData, EEventStatus } from '@/entities/event';
import helpers from '@/ui/helpers';
import { mockUserStateLevel } from '@/test/helpers';
import { mockUsersData } from '@/entities/user';

import Component from '../components/EventSummaryLink.vue';

const localVue = createLocalVue();
const mockEvent = new Event(mockEventsSearchData()[0]);

const actions = {
  toggleSelfRegistration: jest.fn(),
};

describe('EventSummaryLink.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
        },
        computed: {
          registrationUrl() {
            return 'mock-url';
          },
          showSwitchBtn() {
            return true;
          },
        },
        store: {
          modules: {
            user: {
              state: {
                ...mockUsersData()[5],
              },
            },
            event: {
              actions,
            },
          },
        },
      });

      jest.clearAllMocks();
    });

    describe('registration Url', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-registration-link');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('event-summary-registration-link');
        expect(element.text()).toEqual('mock-url');
      });
    });

    describe('copy Registration Link', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-copy-link-btn');
        expect(element.exists()).toBeTruthy();
      });

      it('calls copyRegistrationLink when clicked', async () => {
        jest.spyOn(wrapper.vm, 'copyRegistrationLink').mockImplementation(() => {});

        const element = wrapper.findDataTest('event-summary-copy-link-btn');
        await element.trigger('click');
        expect(wrapper.vm.copyRegistrationLink).toHaveBeenCalledTimes(1);
      });
    });

    describe('toggle', () => {
      it('renders if showSwitchBtn is true and user is level 6', () => {
        const element = wrapper.findDataTest('event-summary-toggle-self-registration');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if showSwitchBtn is false', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
          },
          store: {
            ...mockUserStateLevel(6),
          },
          computed: {
            showSwitchBtn() {
              return false;
            },
          },
        });
        const element = wrapper.findDataTest('event-summary-toggle-self-registration');
        expect(element.exists()).toBeFalsy();
      });

      it('does not render if the user is level below 6', async () => {
        await wrapper.setRole('level5');

        const element = wrapper.findDataTest('event-summary-toggle-self-registration');
        expect(element.exists()).toBeFalsy();
      });

      it('calls toggleSelfRegistration when clicked', async () => {
        expect(actions.toggleSelfRegistration).toHaveBeenCalledTimes(0);

        const element = wrapper.findDataTest('event-summary-toggle-self-registration');
        await element.trigger('click');

        expect(actions.toggleSelfRegistration).toHaveBeenCalledTimes(1);
        expect(actions.toggleSelfRegistration).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: mockEvent.id,
            selfRegistrationEnabled: true,
          },
        );
      });

      it('shows a toast notification when toggleSelfRegistration completes', async () => {
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);

        await wrapper.vm.toggleSelfRegistration(true);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.registrationLinkEnabled');

        await wrapper.vm.toggleSelfRegistration(false);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.registrationLinkDisabled');
      });
    });

    describe('Computed', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
          },
        });
      });

      describe('registrationUrl', () => {
        it('returns the right url', () => {
          wrapper.vm.prefixRegistrationLink = 'mock-prefixRegistrationLink';
          expect(wrapper.vm.registrationUrl).toEqual(`mock-prefixRegistrationLink/en/registration/${mockEvent.registrationLink.translation.en}`);
        });
      });

      describe('showSwitchBtn', () => {
        it('returns true if the event status is open and the user has level 6', () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
            },
            store: {
              ...mockUserStateLevel(6),
            },
          });
          wrapper.vm.event.schedule.status = EEventStatus.Open;
          expect(wrapper.vm.showSwitchBtn).toBeTruthy();
        });

        it('returns false if the event status is not open', () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
            },
            store: {
              ...mockUserStateLevel(6),
            },
          });
          wrapper.vm.event.schedule.status = EEventStatus.Closed;
          expect(wrapper.vm.showSwitchBtn).toBeFalsy();
        });

        it('returns false if the user is not level 6', () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
            },
            store: {
              ...mockUserStateLevel(5),
            },
          });
          wrapper.vm.event.schedule.status = EEventStatus.Open;
          expect(wrapper.vm.showSwitchBtn).toBeFalsy();
        });

        it('returns false if the event has no schedule defined', () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
            },
            store: {
              ...mockUserStateLevel(6),
            },
          });
          wrapper.vm.event.schedule = null;
          expect(wrapper.vm.showSwitchBtn).toBeFalsy();
        });
      });
    });

    describe('Methods', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
          },
          computed: {
            registrationUrl() {
              return 'mock-url';
            },
          },
        });
      });

      describe('copyRegistrationLink', () => {
        it('calls copyToClipBoard helper', async () => {
          jest.spyOn(helpers, 'copyToClipBoard').mockImplementation(() => {});
          await wrapper.vm.copyRegistrationLink();
          expect(helpers.copyToClipBoard).toHaveBeenCalledWith('mock-url');
        });

        it('displays a toast success notification', () => {
          helpers.copyToClipBoard = jest.fn();
          wrapper.vm.copyRegistrationLink();
          expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.copyLinkSuccessful');
        });
      });
    });
  });
});
