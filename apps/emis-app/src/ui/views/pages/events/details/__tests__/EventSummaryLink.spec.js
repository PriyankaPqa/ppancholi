import { VSwitch } from 'vuetify/lib';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity, EEventStatus } from '@libs/entities-lib/event';
import helpers from '@/ui/helpers/helpers';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from '../components/EventSummaryLink.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();
const originalEnv = process.env;

const { pinia, eventStore } = useMockEventStore();
useMockTenantSettingsStore(pinia);

describe('EventSummaryLink.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        event: mockEvent,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    jest.clearAllMocks();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          registrationUrl() {
            return 'mock-url';
          },
          showSwitchBtn() {
            return true;
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

      it('does not render if showSwitchBtn is false', async () => {
        await mountWrapper(true, 6, null, {
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
        await mountWrapper(true, 5, null, {
          computed: {
            showSwitchBtn() {
              return false;
            },
          },
        });

        const element = wrapper.findDataTest('event-summary-toggle-self-registration');
        expect(element.exists()).toBeFalsy();
      });

      it('calls toggleSelfRegistration when changed', async () => {
        await mountWrapper(true, 6, null, {
          computed: {
            showSwitchBtn() {
              return true;
            },
          },
        });
        expect(eventStore.toggleSelfRegistration).toHaveBeenCalledTimes(0);

        const element = wrapper.findComponent(VSwitch);

        element.vm.$emit('change');

        expect(eventStore.toggleSelfRegistration).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('registrationUrl EventSummary', () => {
      it('returns the right url if it is a tempory branch', async () => {
        jest.resetModules();
        process.env = {
          ...originalEnv,
          VITE_TEMP_BRANCH_ID: '9999',
        };
        await mountWrapper();
        expect(wrapper.vm.registrationUrl).toEqual(`https://registration domain en/en/registration/${mockEvent.registrationLink.translation.en}?fb=9999`);
        process.env = originalEnv;
      });
      it('returns the right url if it is not a tempory branch', () => {
        expect(wrapper.vm.registrationUrl).toEqual(`https://registration domain en/en/registration/${mockEvent.registrationLink.translation.en}`);
      });
    });

    describe('showSwitchBtn', () => {
      it('returns true if the event status is open and the user has level 6', async () => {
        await mountWrapper(false, 6);
        wrapper.vm.event.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.showSwitchBtn).toBeTruthy();
      });

      it('returns false if the event status is not open', async () => {
        await mountWrapper(false, 6);
        wrapper.vm.event.schedule.status = EEventStatus.Closed;
        expect(wrapper.vm.showSwitchBtn).toBeFalsy();
      });

      it('returns false if the user is not level 6', async () => {
        await mountWrapper(false, 5);
        wrapper.vm.event.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.showSwitchBtn).toBeFalsy();
      });

      it('returns false if the event has no schedule defined', async () => {
        await mountWrapper(false, 6);
        wrapper.vm.event.schedule = null;
        expect(wrapper.vm.showSwitchBtn).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper(false, 6, null, {
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

    describe('toggleSelfRegistration', () => {
      it('calls the actions toggleSelfRegistration', async () => {
        await wrapper.vm.toggleSelfRegistration(true);
        expect(eventStore.toggleSelfRegistration).toHaveBeenCalledWith({
          id: wrapper.vm.event.id,
          selfRegistrationEnabled: true,
        });
      });

      it('shows a toast notification when toggleSelfRegistration completes successfully', async () => {
        eventStore.toggleSelfRegistration = jest.fn(() => true);
        await wrapper.vm.toggleSelfRegistration(true);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.registrationLinkEnabled');

        await wrapper.vm.toggleSelfRegistration(false);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.registrationLinkDisabled');
      });

      it('resets the value of when toggleSelfRegistration completes successfully', async () => {
        eventStore.toggleSelfRegistration = jest.fn(() => false);
        wrapper.setProps({ event: { selfRegistrationEnabled: false } });
        wrapper.setData({ selfRegistrationEnabled: true });

        await wrapper.vm.toggleSelfRegistration(true);

        expect(wrapper.vm.selfRegistrationEnabled).toEqual(false);
      });
    });
  });
});
