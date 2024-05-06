import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import {
  EEventStatus, mockEventEntity, EventEntity, mockEventEntities,
} from '@libs/entities-lib/event';

import routes from '@/constants/routes';
import { EEventSummarySections } from '@/types';
import helpers from '@/ui/helpers/helpers';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { UserRoles } from '@libs/entities-lib/user';

import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { Status } from '@libs/entities-lib/base';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { mockProvider } from '@/services/provider';
import flushPromises from 'flush-promises';
import Component from '../EventSummary.vue';
import { EDialogComponent } from '../components/DialogComponents';

Vue.config.silent = true;
const localVue = createLocalVue();

const mockEvent = mockEventEntities()[0];
const services = mockProvider();

const pinia = getPiniaForUser(UserRoles.level5);
let eventStore;

const initEventStore = (pinia) => {
  const { eventStore } = useMockEventStore(pinia);

  return eventStore;
};

const mountWithStatus = (status) => {
  const event = mockEventEntity();
  eventStore = initEventStore(pinia);
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
  const doMount = async (pinia = getPiniaForUser(UserRoles.level5), otherComputed = {}, initialFeatures = [], shallow = true) => {
    eventStore = initEventStore(pinia);
    const options = {
      localVue,
      pinia,
      featureList: initialFeatures,
      computed: {
        event() {
          return mockEvent;
        },
        ...otherComputed,
      },
      mocks: {
        $route: {
          name: routes.events.edit.name,
          params: {
            id: '7c076603-580a-4400-bef2-5ddececb0931',
          },
        },
        $services: services,
      },
      stubs: {
        EventStatusDialog: true,
      },
    };
    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await flushPromises();
  };

  beforeEach(() => {
    doMount();
  });
  describe('Template', () => {
    beforeEach(() => {
      doMount();
    });

    describe('exceptional-authentication-section', () => {
      it('renders', async () => {
        await doMount(getPiniaForUser(UserRoles.level5), {}, [], false);
        const element = wrapper.findDataTest('exceptional-authentication-section');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('status select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-detail-status');
        expect(element.exists()).toBeTruthy();
      });

      it('is disabled for users with level below 5', async () => {
        doMount(getPiniaForUser(UserRoles.level4));
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
        doMount(getPiniaForUser(UserRoles.level5), {
          canEdit() {
            return false;
          },
        }, null, false);

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
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        const element = wrapper.findDataTest('call-centre-section');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('call-centre-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no call centres', () => {
        doMount(getPiniaForUser(UserRoles.level5), {
          event() {
            const event = _cloneDeep(mockEvent);
            event.callCentres = [];
            return event;
          },
        }, null, false);

        const element = wrapper.findDataTest('call-centre-section');
        expect(element.exists()).toBeFalsy();
      });

      describe('event-summary-toggle-call-centre', () => {
        it('should display when showToggleForL0Access is true', () => {
          doMount(getPiniaForUser(UserRoles.level6), {
            showToggleForL0Access() {
              return true;
            },
          }, null, false);
          const toggleRegistration = wrapper.findDataTest('event-summary-toggle-registration');
          const toggleAssessment = wrapper.findDataTest('event-summary-toggle-assessment');
          expect(toggleRegistration.exists()).toBeTruthy();
          expect(toggleAssessment.exists()).toBeTruthy();
        });

        it('should display Appointment booking toggle when feature flag is on', () => {
          doMount(getPiniaForUser(UserRoles.level6), {
            showToggleForL0Access() {
              return true;
            },
          }, [FeatureKeys.AppointmentBooking], false);
          const toggle = wrapper.findDataTest('event-summary-toggle-appointment-booking');
          expect(toggle.exists()).toBeTruthy();
        });

        it('shouldnot display Appointment booking toggle when feature flag is off', () => {
          doMount(getPiniaForUser(UserRoles.level6), {
            showToggleForL0Access() {
              return true;
            },
          }, [], false);
          const toggle = wrapper.findDataTest('event-summary-toggle-appointment-booking');
          expect(toggle.exists()).toBeFalsy();
        });
      });

      describe('event-summary-toggle-assessment', () => {
        it('should call toggleAccessAssessment when changed ', () => {
          doMount(getPiniaForUser(UserRoles.level6), {
            showToggleForL0Access() {
              return true;
            },
          }, null, false);
          wrapper.vm.toggleAccessAssessment = jest.fn();

          expect(wrapper.vm.toggleAccessAssessment).toBeCalledTimes(0);

          const element = wrapper.findDataTest('event-summary-toggle-assessment');
          element.vm.$emit('toggleChanged');

          expect(wrapper.vm.toggleAccessAssessment).toBeCalledTimes(1);
        });

        it('should pass correct Props to EventSummaryToggle for call centre', async () => {
          doMount(getPiniaForUser(UserRoles.level6), {
            showToggleForL0Access() {
              return true;
            },
          }, null, false);
          await wrapper.setData({
            updatingAccessAssessmentToggle: false,
          });

          const element = wrapper.findDataTest('event-summary-toggle-assessment');
          const propsLoading = 'loading';
          const propsToggleValue = 'toggleValue';
          const propsTitleOfToggle = 'titleOfToggle';
          expect(element.props(propsTitleOfToggle)).toEqual(wrapper.vm.$t('eventSummary.accessAssessmentEnabled'));
          expect(element.props(propsToggleValue)).toEqual(wrapper.vm.event.assessmentsForL0usersEnabled);
          expect(element.props(propsLoading)).toEqual(wrapper.vm.updatingAccessAssessmentToggle);
        });
      });

      describe('event-summary-toggle-registration', () => {
        it('should call toggleRegistration when changed', () => {
          doMount(getPiniaForUser('level6'), {
            showToggleForL0Access() {
              return true;
            },
          }, null, false);
          wrapper.vm.toggleRegistration = jest.fn();

          expect(wrapper.vm.toggleRegistration).toBeCalledTimes(0);

          const element = wrapper.findDataTest('event-summary-toggle-registration');
          element.vm.$emit('toggleChanged');

          expect(wrapper.vm.toggleRegistration).toBeCalledTimes(1);
        });

        it('should pass correct Props to EventSummaryToggle for call centre', async () => {
          doMount(getPiniaForUser('level6'), {
            showToggleForL0Access() {
              return true;
            },
          }, null, false);
          await wrapper.setData({
            updatingRegistrationToggle: false,
          });

          const element = wrapper.findDataTest('event-summary-toggle-registration');
          const propsLoading = 'loading';
          const propsToggleValue = 'toggleValue';
          const propsTitleOfToggle = 'titleOfToggle';
          expect(element.props(propsTitleOfToggle)).toEqual(wrapper.vm.$t('eventSummary.registrationEnabled'));
          expect(element.props(propsToggleValue)).toEqual(wrapper.vm.event.registrationsForL0usersEnabled);
          expect(element.props(propsLoading)).toEqual(wrapper.vm.updatingRegistrationToggle);
        });
      });
    });

    describe('agreement section', () => {
      it('renders when the event has agreements', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        const element = wrapper.findDataTest('agreement-section');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('agreement-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no agreements', () => {
        doMount(getPiniaForUser('level5'), {
          event() {
            const event = _cloneDeep(mockEvent);
            event.agreements = [];
            return event;
          },
        }, null, false);

        const element = wrapper.findDataTest('agreement-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('registration location section', () => {
      it('renders when the event has registration locations', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        const section = wrapper.findDataTest('registration-location-section');
        expect(section.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        jest.spyOn(wrapper.vm, 'editSection').mockImplementation(() => {});
        const element = wrapper.findDataTest('registration-location-section');
        element.vm.$emit('edit');
        expect(wrapper.vm.editSection).toHaveBeenCalledTimes(1);
      });

      it('does not render when the event has no registration locations', () => {
        doMount(getPiniaForUser('level5'), {
          event() {
            const event = _cloneDeep(mockEvent);
            event.registrationLocations = [];
            return event;
          },
        }, null, false);

        const element = wrapper.findDataTest('registration-location-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('shelter location section', () => {
      it('renders when the event has shelter locations', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
        const section = wrapper.findDataTest('shelter-location-section');
        expect(section.exists()).toBeTruthy();
      });

      it('calls the method editSection when method edit is emitted', () => {
        doMount(getPiniaForUser(UserRoles.level5), null, null, false);
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

    describe('consent statement section', () => {
      it('should render if user is a level 6', async () => {
        await doMount(getPiniaForUser(UserRoles.level6), null, [], false);
        const element = wrapper.findDataTest('event-summary-section-title-EventConsent');
        expect(element.exists()).toBeTruthy();
      });
      it('should not render if user is lower than level 6', async () => {
        await doMount(getPiniaForUser(UserRoles.level5), null, [], false);
        const element = wrapper.findDataTest('event-summary-section-title-EventConsent');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    let eventStore;
    let pinia;
    beforeEach(() => {
      pinia = getPiniaForUser(UserRoles.level5);
      eventStore = initEventStore(pinia);
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

    describe('sortedExceptionalAuth', () => {
      it('calls store and returns mapped data', async () => {
        await wrapper.setData({ exceptionalTypeCounts: [
          { exceptionalAuthenticationTypeId: '111', caseFileCount: 3 },
          { exceptionalAuthenticationTypeId: null, caseFileCount: 5 },
        ] });
        eventStore.getExceptionalAuthenticationTypes = jest.fn(() => [{ id: '111' }, { id: '222' }, { id: '333', isDefault: true }]);
        const data = wrapper.vm.sortedExceptionalAuth;
        expect(eventStore.getExceptionalAuthenticationTypes).toHaveBeenCalledWith(
          true,
          wrapper.vm.event.exceptionalAuthenticationTypes.map((x) => x.exceptionalAuthenticationTypeId),
          wrapper.vm.event,
        );
        expect(data).toEqual([{ count: 3, item: { id: '111' }, max: 2 }, { count: 0, item: { id: '222' } }, { count: 5, item: { id: '333', isDefault: true } }]);
      });
    });

    describe('canEditSections', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 6 and event is on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Open,
              },
            });
          },
        });

        expect(wrapper.vm.canEditSections).toBeTruthy();
      });

      it('returns false if user is level 6 and event is not open or on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Closed,
              },
            });
          },
        });

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });

      it('returns true if user is level 5 and event is open', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEditSections).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open', () => {
        doMount(getPiniaForUser(UserRoles.level5), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Closed,
              },
            });
          },
        });

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });

      it('returns false if user is not level 5', () => {
        doMount(getPiniaForUser(UserRoles.level3));

        expect(wrapper.vm.canEditSections).toBeFalsy();
      });
    });

    describe('canEditAssessmentSection', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 6 and event is on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.OnHold,
              },
            });
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeTruthy();
      });

      it('returns false if user is level 6 and event is not open or on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Closed,
              },
            });
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeFalsy();
      });

      it('returns true if user is level 6 and event is open', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Open,
              },
            });
          },
        });

        expect(wrapper.vm.canEditAssessmentSection).toBeTruthy();
      });

      it('returns false if user is level 5', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEditAssessmentSection).toBeFalsy();
      });
    });

    describe('canEditConsentSection', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 6 and event is on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.OnHold,
              },
            });
          },
        });

        expect(wrapper.vm.canEditConsentSection).toBeTruthy();
      });

      it('returns false if user is level 6 and event is not open or on hold', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Closed,
              },
            });
          },
        });

        expect(wrapper.vm.canEditConsentSection).toBeFalsy();
      });

      it('returns true if user is level 6 and event is open', () => {
        doMount(getPiniaForUser(UserRoles.level6), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Open,
              },
            });
          },
        });

        expect(wrapper.vm.canEditConsentSection).toBeTruthy();
      });

      it('returns false if user is level 5', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEditConsentSection).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      let event;
      beforeEach(() => {
        event = mockEventEntity();
      });

      it('returns true if user is level 5 and event is on hold', () => {
        doMount(getPiniaForUser(UserRoles.level5), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.OnHold,
              },
            });
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user is level 5 and event is not open or on hold', () => {
        doMount(getPiniaForUser(UserRoles.level5), {
          event() {
            return new EventEntity({
              ...event,
              schedule: {
                ...event.schedule,
                status: EEventStatus.Closed,
              },
            });
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns true if user is level 5 and event is open', () => {
        wrapper = mountWithStatus(EEventStatus.Open);

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user is not level 5', () => {
        doMount(getPiniaForUser(UserRoles.level3));

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('showToggleForL0Access', () => {
      it('should return true when user has level6 and event has call centre', async () => {
        doMount(getPiniaForUser(UserRoles.level6), null, [FeatureKeys.L0Access]);
        expect(wrapper.vm.showToggleForL0Access).toBeTruthy();
      });

      it('should return false when user doesnt have level 6,', async () => {
        doMount(getPiniaForUser(UserRoles.level5), null);
        await wrapper.setFeature(FeatureKeys.L0Access, true);
        expect(wrapper.vm.showToggleForL0Access).toBeFalsy();
      });
    });

    describe('consentStatement', () => {
      it('returns correct value if consentStatementId is set', async () => {
        const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
        tenantSettingsStore.currentTenantSettings.consentStatements = [{ id: 'id-1',
          name: {
            translation: {
              en: 'consent statement name-1 en',
              fr: 'consent statement name-1 fr',
            },
          } }];

        wrapper.vm.event.consentStatementId = 'id-1';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.consentStatement).toEqual('consent statement name-1 en');
      });

      it('returns defaultConsentName if consentStatementId is null', async () => {
        wrapper.vm.event.consentStatementId = null;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.consentStatement).toEqual('eventSummary.defaultConsentName');
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
      it('calls the actions assessmentsForL0usersEnabled', async () => {
        await wrapper.vm.toggleAccessAssessment(true);
        expect(eventStore.toggleAssessmentsForL0Users).toHaveBeenCalledWith({
          id: wrapper.vm.event.id,
          assessmentsForL0usersEnabled: true,
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

    describe('toggleAppointmentBooking', () => {
      it('calls the event store action toggleAppointmentBookingForL0Users', async () => {
        await wrapper.vm.toggleAppointmentBooking(true);
        expect(eventStore.toggleAppointmentBookingForL0Users).toHaveBeenCalledWith({
          id: wrapper.vm.event.id,
          appointmentBookingForL0usersEnabled: true,
        });
      });
      it('shows a toast notification when toggleAccessAssessment completes successfully', async () => {
        eventStore.toggleAppointmentBookingForL0Users = jest.fn(() => true);
        await wrapper.vm.toggleAppointmentBooking(true);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.appointmentBookingEnabled');
        await wrapper.vm.toggleAppointmentBooking(false);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.appointmentBookingDisabled');
      });
    });
  });

  describe('lifecycle', () => {
    it('calls store and services', async () => {
      await doMount();
      expect(eventStore.fetchAgreementTypes).toHaveBeenCalled();
      expect(eventStore.fetchExceptionalAuthenticationTypes).toHaveBeenCalled();
      expect(services.caseFiles.getExceptionalTypeCounts).toHaveBeenCalledWith(wrapper.vm.event.id);
    });
  });
});
