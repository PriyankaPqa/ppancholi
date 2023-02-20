import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import {
  EEventStatus, mockEventEntity, EventEntity, mockEventEntities,
} from '@libs/entities-lib/event';

import routes from '@/constants/routes';
import { EEventSummarySections } from '@/types';
import helpers from '@/ui/helpers/helpers';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { Status } from '@libs/entities-lib/base';
import EventSummaryToggle from '@/ui/views/pages/events/details/components/EventSummaryToggle.vue';
import Component, { EDialogComponent } from '../EventSummary.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntities()[0];

const pinia = getPiniaForUser('level5');

const initEventStore = (pinia) => {
  const { eventStore } = useMockEventStore(pinia);

  return eventStore;
};

const mountWithStatus = (status) => {
  const event = mockEventEntity();
  initEventStore(pinia);
  return shallowMount(Component, {
    localVue,
    pinia,
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
        return new EventEntity({
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
  const doMount = (pinia = getPiniaForUser('level5'), level = 5, otherComputed = {}, hasFeature = false) => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      computed: {
        event() {
          return mockEvent;
        },
        agreementTypes() {
          return [];
        },
        responseLevelName() {
          return 'mock-response-level';
        },
        canEditSections() {
          return true;
        },
        canEdit() {
          return true;
        },
        ...otherComputed,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $route: {
          name: routes.events.edit.name,
          params: {
            id: '7c076603-580a-4400-bef2-5ddececb0931',
          },
        },
        $hasFeature: () => hasFeature,
      },
      stubs: {
        EventStatusDialog: true,
      },
    });
  };

  describe('Template', () => {
    beforeEach(() => {
      doMount();
    });

    describe('status select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-detail-status');
        expect(element.exists()).toBeTruthy();
      });

      it('is disabled for users with level below 5', async () => {
        doMount(getPiniaForUser('level4'), 4);
        const element = wrapper.findDataTest('event-detail-status');
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
        expect(element.text()).toEqual(wrapper.vm.responseLevelName);
      });
    });

    describe('edit button', () => {
      it('renders when canEditSections is true', () => {
        const element = wrapper.findDataTest('event-edit-button');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render when canEditSections is false', async () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            event() {
              return mockEvent;
            },
            agreementTypes() {
              return [];
            },
            responseLevelName() {
              return 'mock-response-level';
            },
            canEdit() {
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

        const element = wrapper.findDataTest('event-edit-button');
        expect(element.exists()).toBeFalsy();
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

      describe('event-summary-toggle-call-centre', () => {
        it('should display when showAccessAssessmentToggle is true', () => {
          doMount(getPiniaForUser('level6'), 6, {
            showAccessAssessmentToggle() {
              return true;
            },
          });
          const element = wrapper.findDataTest('event-summary-toggle-call-centre');
          expect(element.exists()).toBeTruthy();
        });
      });

      describe('event-summary-toggle', () => {
        it('should call toggleAccessAssessment when changed', () => {
          doMount(getPiniaForUser('level6'), 6, {
            showAccessAssessmentToggle() {
              return true;
            },
          });
          wrapper.vm.toggleAccessAssessment = jest.fn();

          expect(wrapper.vm.toggleAccessAssessment).toBeCalledTimes(0);

          const element = wrapper.findComponent(EventSummaryToggle);
          element.vm.$emit('toggleChanged');

          expect(wrapper.vm.toggleAccessAssessment).toBeCalledTimes(1);
        });

        it('should pass correct Props to EventSummaryToggle for call centre', async () => {
          doMount(getPiniaForUser('level6'), 6, {
            showAccessAssessmentToggle() {
              return true;
            },
          });
          await wrapper.setData({
            updatingAccessAssessmentToggle: false,
          });

          const element = wrapper.findDataTest('event-summary-toggle-call-centre');
          const propsLoading = 'loading';
          const propsToggleValue = 'toggleValue';
          const propsTitleOfToggle = 'titleOfToggle';
          expect(element.props(propsTitleOfToggle)).toEqual(wrapper.vm.$t('eventSummary.accessAssessmentEnabled'));
          expect(element.props(propsToggleValue)).toEqual(wrapper.vm.event.assessmentsForL0usersEnabled);
          expect(element.props(propsLoading)).toEqual(wrapper.vm.updatingAccessAssessmentToggle);
        });
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
      initEventStore(pinia);
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
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

    describe('agreementTypes', () => {
      it('return the agreement types from the storage', () => {
        expect(wrapper.vm.agreementTypes).toEqual(mockOptionItemData());
      });
    });

    describe('activeAssessments', () => {
      it('return the active assessments', () => {
        const event = mockEventEntities()[0];
        wrapper = shallowMount(Component, {
          localVue,
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
              return new EventEntity(event);
            },
          },
        });
        expect(wrapper.vm.activeAssessments.length).toEqual(event.registrationAssessments.length);
        event.registrationAssessments[0].status = Status.Inactive;
        wrapper = shallowMount(Component, {
          localVue,
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
              return new EventEntity(event);
            },
          },
        });
        expect(wrapper.vm.activeAssessments.length).toEqual(event.registrationAssessments.length - 1);
      });
    });

    describe('event', () => {
      it('return the event by id from the storage', () => {
        expect(wrapper.vm.event).toEqual(new EventEntity(mockEvent));
      });
    });

    describe('sortedCallCentres', () => {
      it('return the callCentres sorted by name', () => {
        expect(wrapper.vm.sortedCallCentres).toEqual(helpers.sortMultilingualArray(mockEvent.callCentres, 'name')
          .map((c) => ({ ...c, startDate: new Date(c.startDate) })));
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
        expect(wrapper.vm.sortedAgreements).toEqual(helpers.sortMultilingualArray(mockEvent.agreements, 'name')
          .map((a) => ({ ...a, startDate: new Date(a.startDate) })));
      });
    });

    describe('canEditSections', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 6 and event is on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Open,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditSections).toBeTruthy();
      });

      it('returns false if user is level 6 and event is not open or on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Closed,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });

      it('returns true if user is level 5 and event is open', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEditSections).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level5'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Closed,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });

      it('returns false if user is not level 5', () => {
        const pinia = getPiniaForUser('level3');
        initEventStore(pinia);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });
    });

    describe('canEditAssessmentSection', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 6 and event is on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.OnHold,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeTruthy();
      });

      it('returns false if user is level 6 and event is not open or on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Closed,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeFalsy();
      });

      it('returns true if user is level 6 and event is open', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Open,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeTruthy();
      });

      it('returns false if user is level 5', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEditAssessmentSection).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 5 and event is on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level5'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.OnHold,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open or on hold', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level5'),
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
              return new EventEntity({
                ...event,
                schedule: {
                  ...event.schedule,
                  status: EEventStatus.Closed,
                },
              });
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns true if user is level 5 and event is open', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user is not level 5', () => {
        const pinia = getPiniaForUser('level3');
        initEventStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.edit.name,
              params: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('showAccessAssessmentToggle', () => {
      it('should return true when user has level6 and event has call centre', () => {
        doMount(getPiniaForUser('level6'), 6, null, true);
        expect(wrapper.vm.showAccessAssessmentToggle).toBeTruthy();
      });

      it('should return false when user doesnt have level 6,', () => {
        doMount(getPiniaForUser('level5'), 5, null, true);
        expect(wrapper.vm.showAccessAssessmentToggle).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    const eventStore = initEventStore(pinia);
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
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
      it('sets the newStatus property as the argument and sets showEventStatusDialog to true when the status is Open', async () => {
        wrapper.vm.event.hasBeenOpen = jest.fn(() => true);
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

        expect(eventStore.setEventStatus).toHaveBeenCalledTimes(1);
        expect(eventStore.setEventStatus).toHaveBeenCalledWith(
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

    describe('toggleAccessAssessment', () => {
      it('calls the actions assessmentsForL0UsersEnabled', async () => {
        await wrapper.vm.toggleAccessAssessment(true);
        expect(eventStore.toggleAssessmentsForL0Users).toHaveBeenCalledWith({
          id: wrapper.vm.event.id,
          assessmentsForL0UsersEnabled: true,
        });
      });

      it('shows a toast notification when toggleAccessAssessment completes successfully', async () => {
        eventStore.toggleAssessmentsForL0Users = jest.fn(() => true);
        await wrapper.vm.toggleAccessAssessment(true);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.accessAssessmentEnabled');

        await wrapper.vm.toggleAccessAssessment(false);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.accessAssessmentDisabled');
      });
    });
  });
});
