import { Store, ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import {
  OptionItem, mockOptionItemData, EOptionLists,
} from '@libs/entities-lib/optionItem';

import {
  EEventStatus,
  EventEntity,
  IEventEntity,
  mockEventEntities,
  mockEventEntity,
} from '@libs/entities-lib/event';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers/helpers';
import { EventsService } from '@/services/events/entity';
import { OptionItemsService } from '@/services/optionItems';
import { EEventSummarySections } from '@/types';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { Status } from '@libs/entities-lib/base';
import { EventEntityModule } from './eventEntity';

import { IEventEntityState } from './eventEntity.types';

const service = new EventsService(httpClient);
const optionsService = new OptionItemsService(httpClient);
const signalR = mockSignalR();
const myModule = new EventEntityModule(service, optionsService, signalR);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IEventEntityState, IEventEntityState>;

describe('>>> Event Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    store = mockStore({
      modules: {
        event: {
          state: {
            agreementTypes: mockOptionItemData(),
            eventTypes: mockOptionItemData(),
            items: mockEventEntities(),
            searchLoading: false,
            agreementTypesFetched: false,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('agreementTypes', () => {
      it('returns an array of agreementTypes sorted by orderRank and filtered by status', () => {
        const mockAgreementTypes = mockOptionItemData().map((e) => new OptionItem(e));
        myModule.mutations.setAgreementTypes(myModule.state, mockAgreementTypes);
        const res = myModule.getters.agreementTypes(myModule.state)();

        expect(res).toEqual(
          _sortBy(mockAgreementTypes, 'orderRank').filter((i) => i.status === Status.Active),
        );
      });
    });

    describe('eventTypes', () => {
      it('returns an array of EventTypes sorted by orderRank and filtered by status', () => {
        const mockEventTypes = mockOptionItemData().map((e) => new OptionItem(e));
        myModule.mutations.setEventTypes(myModule.state, mockEventTypes);
        const res = myModule.getters.eventTypes(myModule.state)();

        expect(res).toEqual(
          _sortBy(mockEventTypes, 'orderRank').filter((i) => i.status === Status.Active),
        );
      });
    });

    describe('events', () => {
      it('returns an array of Events sorted by name', () => {
        myModule.mutations.setAll(myModule.state, mockEventEntities());
        const res = myModule.getters.getAll(myModule.state);
        const sortedEvents = helpers.sortMultilingualArray(mockEventEntities(), 'name');

        expect(JSON.stringify(res)).toEqual(JSON.stringify(sortedEvents));
      });
    });

    describe('eventsByStatus', () => {
      it('returns an array of Events sorted by name and filtered by statuses', () => {
        myModule.mutations.setAll(myModule.state, mockEventEntities());
        const res = myModule.getters.eventsByStatus(myModule.state)([EEventStatus.Open]);
        const activeEvents = mockEventEntities().filter((ee) => ee.schedule.status === EEventStatus.Open);
        const sortedActiveEvents = helpers.sortMultilingualArray(activeEvents, 'name');

        expect(JSON.stringify(res)).toEqual(JSON.stringify(sortedActiveEvents));
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setAgreementTypes', () => {
      it('sets the agreement types array', () => {
        const entity = mockOptionItemData();
        myModule.mutations.setAgreementTypes(myModule.state, entity);
        expect(myModule.state.agreementTypes).toEqual(entity);
      });
    });

    describe('setEventTypes', () => {
      it('sets the event types array', () => {
        const entity = mockOptionItemData();
        myModule.mutations.setEventTypes(myModule.state, entity);
        expect(myModule.state.eventTypes).toEqual(entity);
      });
    });

    describe('setAgreementTypesFetched', () => {
      test('the setAgreementTypesFetched mutation sets the agreementTypesFetched state', () => {
        myModule.mutations.setAgreementTypesFetched(myModule.state, true);
        expect(myModule.state.agreementTypesFetched).toBeTruthy();
        myModule.mutations.setAgreementTypesFetched(myModule.state, false);
        expect(myModule.state.agreementTypesFetched).toBeFalsy();
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        myModule.mutations.setSearchLoading(myModule.state, true);
        expect(myModule.state.searchLoading).toBeTruthy();
        myModule.mutations.setSearchLoading(myModule.state, false);
        expect(myModule.state.searchLoading).toBeFalsy();
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchAgreementTypes', () => {
      it('calls the getAgreementTypes service and returns the eventTypes getter', async () => {
        myModule.state.agreementTypesFetched = false;
        myModule.optionsService.getOptionList = jest.fn();
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        const res = await myModule.actions.fetchAgreementTypes(actionContext);
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.AgreementTypes);
        expect(actionContext.commit).toBeCalledWith('setAgreementTypes', res);
        expect(actionContext.commit).toBeCalledWith('setAgreementTypesFetched', true);
      });

      test('if the getEventTypes action has already been called it will not call the service again', async () => {
        myModule.state.agreementTypesFetched = true;
        myModule.optionsService.getOptionList = jest.fn();
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        await myModule.actions.fetchAgreementTypes(actionContext);
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
      });
    });

    describe('fetchEventTypes', () => {
      it('calls the getEventsTypes service and returns the eventTypes getter', async () => {
        myModule.state.eventTypesFetched = false;
        myModule.optionsService.getOptionList = jest.fn();
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        const res = await myModule.actions.fetchEventTypes(actionContext);
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.EventTypes);
        expect(actionContext.commit).toBeCalledWith('setEventTypes', res);
        expect(actionContext.commit).toBeCalledWith('setEventTypesFetched', true);
      });

      test('if the getEventTypes action has already been called it will not call the service again', async () => {
        myModule.state.eventTypesFetched = true;
        myModule.optionsService.getOptionList = jest.fn();
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        await myModule.actions.fetchEventTypes(actionContext);
        expect(myModule.optionsService.getOptionList).toHaveBeenCalledTimes(0);
      });
    });

    describe('fetchOtherProvinces', () => {
      it('calls the fetchOtherProvinces() function', async () => {
        myModule.service.getOtherProvinces = jest.fn();
        expect(myModule.service.getOtherProvinces).toHaveBeenCalledTimes(0);
        await myModule.actions.fetchOtherProvinces();
        expect(myModule.service.getOtherProvinces).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchRegions', () => {
      it('calls the fetchRegions() function', async () => {
        myModule.service.getRegions = jest.fn();
        expect(myModule.service.getRegions).toHaveBeenCalledTimes(0);
        await myModule.actions.fetchRegions();
        expect(myModule.service.getRegions).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateEventSection', () => {
      it('calls the addCallCentre service and returns the new Event entity, if section is call centre and action is add', async () => {
        const event = mockEventEntity();
        myModule.service.addCallCentre = jest.fn(() => Promise.resolve(event));
        const callCentre = event.callCentres[0];
        expect(myModule.service.addCallCentre).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
        });

        expect(res).toEqual(event);
        expect(myModule.service.addCallCentre).toHaveBeenCalledTimes(1);
        expect(myModule.service.addCallCentre).toHaveBeenCalledWith(event.id, callCentre);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the editCallCentre service and returns the new Event entity, if section is call centre and action is edit', async () => {
        const event = mockEventEntity();
        myModule.service.editCallCentre = jest.fn(() => Promise.resolve(event));
        const callCentre = event.callCentres[0];
        expect(myModule.service.editCallCentre).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'edit',
        });

        expect(res).toEqual(event);
        expect(myModule.service.editCallCentre).toHaveBeenCalledTimes(1);
        expect(myModule.service.editCallCentre).toHaveBeenCalledWith(event.id, callCentre);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it(' calls the addAgreement service and returns the new Event entity, if section is agreement and action is add', async () => {
        const event = mockEventEntity();
        const agreement = { ...event.agreements[0] };
        myModule.service.addAgreement = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.addAgreement).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'add',
        });

        expect(myModule.service.addAgreement).toHaveBeenCalledTimes(1);
        expect(myModule.service.addAgreement).toHaveBeenCalledWith(event.id, agreement);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the editAgreement service and returns the new Event entity, if  section is agreement and action is edit,', async () => {
        const event = mockEventEntity();
        const agreement = { ...event.agreements[0] };
        myModule.service.editAgreement = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.editAgreement).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'edit',
        });

        expect(res).toEqual(event);
        expect(myModule.service.editAgreement).toHaveBeenCalledTimes(1);
        expect(myModule.service.editAgreement).toHaveBeenCalledWith(event.id, agreement);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the addRegistrationLocation service and returns the new Event entity, if section is registration location and action is add',
        async () => {
          const event = mockEventEntity();
          const location = event.registrationLocations[0];
          myModule.service.addRegistrationLocation = jest.fn(() => Promise.resolve(event));
          expect(myModule.service.addRegistrationLocation).toHaveBeenCalledTimes(0);

          const res = await myModule.actions.updateEventSection(actionContext, {
            eventId: event.id, payload: location, section: EEventSummarySections.RegistrationLocation, action: 'add',
          });

          expect(myModule.service.addRegistrationLocation).toHaveBeenCalledTimes(1);
          expect(myModule.service.addRegistrationLocation).toHaveBeenCalledWith(event.id, location);
          expect(actionContext.commit).toBeCalledWith('set', event);
          expect(res).toEqual(event);
        });

      it('calls the editRegistrationLocation service and returns the new Event entity', async () => {
        const event = mockEventEntity();
        const location = event.registrationLocations[0];

        myModule.service.editRegistrationLocation = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.editRegistrationLocation).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(actionContext, {
          eventId: event.id,
          payload: location,
          section: EEventSummarySections.RegistrationLocation,
          action: 'edit',
        });

        expect(myModule.service.editRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(myModule.service.editRegistrationLocation).toHaveBeenCalledWith(event.id, location);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });

      it('calls the addShelterLocation service and returns the new Event entity,if section is shelter location and action is add', async () => {
        const event = mockEventEntity();
        const location = event.shelterLocations[0];
        myModule.service.addShelterLocation = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.addShelterLocation).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(
          actionContext,
          {
            eventId: event.id,
            payload: location,
            section: EEventSummarySections.ShelterLocation,
            action: 'add',
          },
        );

        expect(myModule.service.addShelterLocation).toHaveBeenCalledTimes(1);
        expect(myModule.service.addShelterLocation).toHaveBeenCalledWith(event.id, location);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });

      it('calls the editShelterLocation service and returns the new Event entity,if section is shelter location and action is edit', async () => {
        const event = mockEventEntity();
        const shelterLocation = event.shelterLocations[0];
        myModule.service.editShelterLocation = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.editShelterLocation).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.updateEventSection(
          actionContext,
          {
            eventId: event.id,
            payload: shelterLocation,
            section: EEventSummarySections.ShelterLocation,
            action: 'edit',
          },
        );

        expect(myModule.service.editShelterLocation).toHaveBeenCalledTimes(1);
        expect(myModule.service.editShelterLocation).toHaveBeenCalledWith(event.id, shelterLocation);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });
    });

    describe('deleteAgreement', () => {
      it('calls the removeAgreement service and returns the new Event entity', async () => {
        const event = mockEventEntity();

        const agreementId = event.agreements[0].id;
        myModule.service.removeAgreement = jest.fn(() => Promise.resolve(event));
        expect(myModule.service.removeAgreement).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.deleteAgreement(actionContext, { eventId: event.id, agreementId });

        expect(myModule.service.removeAgreement).toHaveBeenCalledTimes(1);
        expect(myModule.service.removeAgreement).toHaveBeenCalledWith(event.id, agreementId);
        expect(res).toEqual(event);
      });
    });

    describe('createEvent', () => {
      it('should call createEvent service with proper params', async () => {
        const payload = {} as IEventEntity;
        const res = {} as IEventEntity;
        myModule.service.createEvent = jest.fn(() => Promise.resolve(res));
        await myModule.actions.createEvent(actionContext, payload);

        expect(myModule.service.createEvent).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('toggleSelfRegistration', () => {
      it('calls the setEventSelfRegistration service', async () => {
        const event = mockEventEntity();
        myModule.service.toggleSelfRegistration = jest.fn(() => Promise.resolve(event));
        const payload = {
          id: event.id,
          selfRegistrationEnabled: true,
        };
        expect(myModule.service.toggleSelfRegistration).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.toggleSelfRegistration(actionContext, payload);

        expect(res).toEqual(event);
        expect(myModule.service.toggleSelfRegistration).toHaveBeenCalledTimes(1);
        expect(myModule.service.toggleSelfRegistration).toHaveBeenCalledWith(event.id, true);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('setEventStatus', () => {
      it('calls the setEventStatus service', async () => {
        const event = new EventEntity(mockEventEntity());
        myModule.service.setEventStatus = jest.fn(() => Promise.resolve(event));
        const payload = {
          event,
          status: EEventStatus.Open,
          reason: 're-open',
        };
        expect(myModule.service.setEventStatus).toHaveBeenCalledTimes(0);

        const res = await myModule.actions.setEventStatus(actionContext, payload);

        expect(res).toEqual(event);
        expect(myModule.service.setEventStatus).toHaveBeenCalledTimes(1);
        expect(myModule.service.setEventStatus).toHaveBeenCalledWith(event.id, EEventStatus.Open, true, 're-open');
        expect(actionContext.commit).toBeCalledWith('set', event);
      });
    });
  });
});
