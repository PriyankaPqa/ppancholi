import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, EEventStatus, mockEventsSearchData } from '@/entities/event';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import _cloneDeep from 'lodash/cloneDeep';
import { EEventSummarySections } from '@/types';
import helpers from '@/ui/helpers';
import { mockUserStateLevel } from '@/test/helpers';
import { mockOptionItemData } from '@/entities/optionItem';

import Component, { EDialogComponent } from '../EventSummary.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEvent = new Event(mockEventsSearchData()[0]);

const mountWithStatus = (status) => {
  const event = mockEventsSearchData()[0];

  return shallowMount(Component, {
    localVue,
    store: {
      ...mockUserStateLevel(5),
    },
    mocks: {
      $route: {
        name: routes.events.edit.name,
        params: {
          id: '7c076603-580a-4400-bef2-5ddececb0931',
        },
      },
    },
    computed: {
      event() {
        return new Event({
          ...event,
          schedule: {
            ...event.schedule,
            status,
          },
        });
      },
    },

  });
};

describe('EventSummary.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          event() {
            return mockEvent;
          },
          agreementTypes() {
            return [];
          },
        },
        store: {
          ...mockUserStateLevel(5),
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },

        },
        stubs: {
          EventStatusDialog: true,
        },
      });
    });

    describe('status select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-detail-status');
        expect(element.exists()).toBeTruthy();
      });

      it('is disabled for users with level below 5', async () => {
        const element = wrapper.findDataTest('event-detail-status');

        expect(element.props('disabled')).toBeFalsy();
        await wrapper.setRole('level4');

        expect(element.props('disabled')).toBeTruthy();
      });

      it('calls the method onStatusChangeInit on change', () => {
        jest.spyOn(wrapper.vm, 'onStatusChangeInit').mockImplementation(() => {});
        const element = wrapper.findDataTest('event-detail-status');
        element.vm.$emit('input');
        expect(wrapper.vm.onStatusChangeInit).toHaveBeenCalledTimes(1);
      });
    });

    describe('response level', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-response-level');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        const element = wrapper.findDataTest('event-summary-response-level');
        expect(element.text()).toEqual(wrapper.vm.event.responseLevelName.translation.en);
      });
    });

    describe('edit button', () => {
      it('renders when user is above level 5', () => {
        const element = wrapper.findDataTest('event-edit-button');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render when user is below level 5', async () => {
        await wrapper.setRole('level4');

        const element = wrapper.findDataTest('event-edit-button');
        expect(element.exists()).toBeFalsy();
      });

      it('calls the method editEvent on click', () => {
        jest.spyOn(wrapper.vm, 'editEvent').mockImplementation(() => {});
        const element = wrapper.findDataTest('event-edit-button');
        element.vm.$emit('click');
        expect(wrapper.vm.editEvent).toHaveBeenCalledTimes(1);
      });

      it('is hidden if showEditButton is false', async () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              return mockEvent;
            },
            showEditButton() {
              return false;
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
          stubs: {
            EventStatusDialog: true,
          },
        });

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(false);
      });
    });

    describe('description', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-description');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        const element = wrapper.findDataTest('event-summary-description');
        expect(element.text()).toEqual(wrapper.vm.event.description.translation.en);
      });
    });

    describe('call centre section', () => {
      it('renders when the event has call centres', () => {
        const element = wrapper.findDataTest('call-centre-section');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('call-centre-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no call centres', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              const event = _cloneDeep(mockEvent);
              event.callCentres = [];
              return event;
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },

          },
          stubs: {
            EventStatusDialog: true,
          },
        });

        const element = wrapper.findDataTest('call-centre-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('agreement section', () => {
      it('renders when the event has agreements', () => {
        const element = wrapper.findDataTest('agreement-section');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('agreement-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no agreements', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              const event = _cloneDeep(mockEvent);
              event.agreements = [];
              return event;
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },

          },
          stubs: {
            EventStatusDialog: true,
          },
        });

        const element = wrapper.findDataTest('agreement-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('registration location section', () => {
      it('renders when the event has registration locations', () => {
        const section = wrapper.findDataTest('registration-location-section');

        expect(section.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('registration-location-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no registration locations', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              const event = _cloneDeep(mockEvent);
              event.registrationLocations = [];
              return event;
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },

          },
          stubs: {
            EventStatusDialog: true,
          },
        });

        const element = wrapper.findDataTest('registration-location-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('shelter location section', () => {
      it('renders when the event has shelter locations', () => {
        const section = wrapper.findDataTest('shelter-location-section');

        expect(section.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('shelter-location-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no shelter locations', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              const event = _cloneDeep(mockEvent);
              event.shelterLocations = [];
              return event;
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },

          },
          stubs: {
            EventStatusDialog: true,
          },
        });

        const element = wrapper.findDataTest('shelter-location-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('status dialog', () => {
      it('renders when showEventStatusDialog is true and newStatus is not empty', async () => {
        let element;
        element = wrapper.findDataTest('event-summary-status-dialog');
        expect(element.exists()).toBeFalsy();

        wrapper.vm.showEventStatusDialog = true;
        wrapper.vm.newStatus = 1;
        await wrapper.vm.$nextTick();
        element = wrapper.findDataTest('event-summary-status-dialog');
        expect(element.exists()).toBeTruthy();
      });

      it('calls onStatusChange on submit', async () => {
        jest.spyOn(wrapper.vm, 'onStatusChange').mockImplementation(() => {});

        wrapper.vm.showEventStatusDialog = true;
        wrapper.vm.newStatus = 1;
        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('event-summary-status-dialog');
        element.vm.$emit('submit');

        expect(wrapper.vm.onStatusChange).toHaveBeenCalledTimes(1);
      });

      it('sets showEventStatusDialog to false on cancelChange', async () => {
        wrapper.vm.showEventStatusDialog = true;
        wrapper.vm.newStatus = 1;
        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('event-summary-status-dialog');
        element.vm.$emit('cancelChange');

        expect(wrapper.vm.showEventStatusDialog).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.event.getters.eventById.mockReturnValueOnce(mockEvent);
      storage.event.getters.agreementTypes.mockReturnValueOnce(mockOptionItemData());

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
          $storage: storage,
        },
      });
    });

    describe('agreementTypes', () => {
      it('return the agreement types from the storage', () => {
        expect(wrapper.vm.agreementTypes).toEqual(mockOptionItemData());
      });
    });
    describe('event', () => {
      it('return the event by id from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEvent);
      });
    });

    describe('sortedCallCentres', () => {
      it('return the callCentres sorted by name', () => {
        expect(wrapper.vm.sortedCallCentres).toEqual(helpers.sortMultilingualArray(mockEvent.callCentres, 'name'));
      });
    });

    describe('sortedRegistrationLocations', () => {
      it('return the locations sorted by name', () => {
        expect(wrapper.vm.sortedRegistrationLocations).toEqual(helpers.sortMultilingualArray(mockEvent.registrationLocations, 'name'));
      });
    });

    describe('sortedShelterLocations', () => {
      it('return the locations sorted by name', () => {
        expect(wrapper.vm.sortedShelterLocations).toEqual(helpers.sortMultilingualArray(mockEvent.shelterLocations, 'name'));
      });
    });

    describe('showEditButton', () => {
      it('returns true if the event status is open or on hold', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.event.schedule.status).toBe(EEventStatus.Open);

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(true);

        wrapper = mountWithStatus(EEventStatus.OnHold);

        expect(wrapper.vm.event.schedule.status).toBe(EEventStatus.OnHold);

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(true);
      });

      it('returns false if the event status is closed or archived', () => {
        wrapper = mountWithStatus(EEventStatus.Archived);

        expect(wrapper.vm.event.schedule.status).toBe(EEventStatus.Archived);

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(false);

        wrapper = mountWithStatus(EEventStatus.Closed);

        expect(wrapper.vm.event.schedule.status).toBe(EEventStatus.Closed);

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(false);
      });

      it('returns false if user level is below 5', async () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        await wrapper.setRole('level4');

        expect(wrapper.vm.showEditButton).toBeFalsy();

        expect(wrapper.findDataTest('event-edit-button').exists()).toBe(false);
      });
    });

    describe('statuses', () => {
      it('returns onhold and closed if event status is open', async () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.statuses).toEqual([EEventStatus.OnHold, EEventStatus.Closed]);
      });

      it('returns open and closed if event status is on hold', async () => {
        wrapper = mountWithStatus(EEventStatus.OnHold);

        expect(wrapper.vm.statuses).toEqual([EEventStatus.Open, EEventStatus.Closed]);
      });

      it('returns open, on hold and archived if event status is closed', async () => {
        wrapper = mountWithStatus(EEventStatus.Closed);

        expect(wrapper.vm.statuses).toEqual([EEventStatus.Open, EEventStatus.OnHold, EEventStatus.Archived]);
      });

      it('returns open and on hold if event status is archived', async () => {
        wrapper = mountWithStatus(EEventStatus.Archived);

        expect(wrapper.vm.statuses).toEqual([EEventStatus.Open, EEventStatus.OnHold]);
      });
    });

    describe('sortedAgreements', () => {
      it('return the agreements sorted by name', () => {
        expect(wrapper.vm.sortedAgreements).toEqual(helpers.sortMultilingualArray(mockEvent.agreements, 'name'));
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.event.actions.fetchEvent = jest.fn(() => {});
      storage.event.actions.fetchAgreementTypes = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
          $storage: storage,
        },
      });
    });

    it('should call fetchEvent', () => {
      expect(wrapper.vm.$storage.event.actions.fetchEvent).toHaveBeenCalledWith(wrapper.vm.$route.params.id);
    });

    it('should call fetchAgreementTypes', () => {
      expect(wrapper.vm.$storage.event.actions.fetchAgreementTypes).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    const actions = {
      setEventStatus: jest.fn(),
    };

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          event() {
            return mockEvent;
          },
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
        },
        store: {
          modules: {
            event: {
              actions,
            },
          },
        },
      });
    });

    describe('editEvent', () => {
      it('should redirect to the edit page with proper id', async () => {
        wrapper.vm.editEvent();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.edit.name, params: { id: mockEvent.id },
        });
      });
    });

    describe('onStatusChangeInit', () => {
      it('sets the newStatus property as the argument and sets showEventStatusDialog to true when the status is Open', () => {
        wrapper.vm.showEventStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(EEventStatus.Open);
        expect(wrapper.vm.showEventStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(EEventStatus.Open);
      });
      it('sets the newStatus property as the argument and sets showEventStatusDialog to true when the status is Closed', () => {
        wrapper.vm.showEventStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(EEventStatus.Closed);
        expect(wrapper.vm.showEventStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(EEventStatus.Closed);
      });

      it('calls onStatusChange when the status is not Open or Close', () => {
        jest.spyOn(wrapper.vm, 'onStatusChange').mockImplementation(() => {});
        wrapper.vm.onStatusChangeInit(EEventStatus.OnHold);
        expect(wrapper.vm.onStatusChange).toHaveBeenCalledWith({ status: EEventStatus.OnHold, reason: null });
      });
    });

    describe('onStatusChange', () => {
      it('dispatches the setEventStatus action', async () => {
        await wrapper.vm.onStatusChange({
          status: EEventStatus.Open,
          reason: 'Re-open',
        });

        expect(actions.setEventStatus).toHaveBeenCalledTimes(1);
        expect(actions.setEventStatus).toHaveBeenCalledWith(
          expect.anything(),
          {
            event: wrapper.vm.event,
            status: EEventStatus.Open,
            reason: 'Re-open',
          },
        );
      });
    });

    describe('onSectionAdd', () => {
      it('sets currentDialog to the right object', async () => {
        wrapper.vm.currentDialog = null;
        await wrapper.vm.onSectionAdd(EEventSummarySections.CallCentre);
        expect(wrapper.vm.currentDialog).toEqual({
          component: EDialogComponent.CallCentre,
          isEditMode: false,
        });
      });
    });

    describe('editSection', () => {
      it('sets currentDialog to the right object', async () => {
        wrapper.vm.currentDialog = null;
        await wrapper.vm.editSection('foo', EEventSummarySections.CallCentre);
        expect(wrapper.vm.currentDialog).toEqual({
          component: EDialogComponent.CallCentre,
          isEditMode: true,
          id: 'foo',
        });
      });
    });
  });
});
