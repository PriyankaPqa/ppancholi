import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData, EEventStatus } from '@/entities/event';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import _cloneDeep from 'lodash/cloneDeep';
import { EEventSummarySections } from '@/types';
import helpers from '@/ui/helpers';

import Component, { EDialogComponent } from '../EventSummary.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEvent = new Event(mockEventsSearchData()[0]);

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
      it('renders', () => {
        const element = wrapper.findDataTest('event-edit-button');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method editEvent on click', () => {
        jest.spyOn(wrapper.vm, 'editEvent').mockImplementation(() => {});
        const element = wrapper.findDataTest('event-edit-button');
        element.vm.$emit('click');
        expect(wrapper.vm.editEvent).toHaveBeenCalledTimes(1);
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
  });
  describe('lifecycle', () => {
    beforeEach(() => {
      storage.event.actions.fetchEvent = jest.fn(() => {});

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
  });

  describe('Methods', () => {
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
      it('sets the newStatus property as the argument and sets  showEventStatusDialog to true when the status is Open', () => {
        wrapper.vm.showEventStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(EEventStatus.Open);
        expect(wrapper.vm.showEventStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(EEventStatus.Open);
      });
      it('sets the newStatus property as the argument and sets  showEventStatusDialog to true when the status is Closed', () => {
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
