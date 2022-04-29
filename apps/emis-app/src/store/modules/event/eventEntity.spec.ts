import { Store, ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import {
  OptionItem, mockOptionItemData, EOptionLists,
} from '@/entities/optionItem';

import {
  EEventStatus,
  EventEntity,
  IEventEntity,
  mockEventEntities,
  mockEventEntity,
} from '@/entities/event';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers/helpers';
import { EventsService } from '@/services/events/entity';
import { OptionItemsService } from '@/services/optionItems';
import { EEventSummarySections } from '@/types';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { Status } from '@libs/core-lib/entities/base';
import { EventEntityModule } from './eventEntity';

import { IEventEntityState } from './eventEntity.types';

const service = new EventsService(httpClient);
const optionsService = new OptionItemsService(httpClient);
const signalR = mockSignalR();
const module = new EventEntityModule(service, optionsService, signalR);

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
        module.mutations.setAgreementTypes(module.state, mockAgreementTypes);
        const res = module.getters.agreementTypes(module.state)();

        expect(res).toEqual(
          _sortBy(mockAgreementTypes, 'orderRank').filter((i) => i.status === Status.Active),
        );
      });
    });

    describe('eventTypes', () => {
      it('returns an array of EventTypes sorted by orderRank and filtered by status', () => {
        const mockEventTypes = mockOptionItemData().map((e) => new OptionItem(e));
        module.mutations.setEventTypes(module.state, mockEventTypes);
        const res = module.getters.eventTypes(module.state)();

        expect(res).toEqual(
          _sortBy(mockEventTypes, 'orderRank').filter((i) => i.status === Status.Active),
        );
      });
    });

    describe('events', () => {
      it('returns an array of Events sorted by name', () => {
        module.mutations.setAll(module.state, mockEventEntities());
        const res = module.getters.getAll(module.state);
        const sortedEvents = helpers.sortMultilingualArray(mockEventEntities(), 'name');

        expect(JSON.stringify(res)).toEqual(JSON.stringify(sortedEvents));
      });
    });

    describe('eventsByStatus', () => {
      it('returns an array of Events sorted by name and filtered by statuses', () => {
        module.mutations.setAll(module.state, mockEventEntities());
        const res = module.getters.eventsByStatus(module.state)([EEventStatus.Open]);
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
        module.mutations.setAgreementTypes(module.state, entity);
        expect(module.state.agreementTypes).toEqual(entity);
      });
    });

    describe('setEventTypes', () => {
      it('sets the event types array', () => {
        const entity = mockOptionItemData();
        module.mutations.setEventTypes(module.state, entity);
        expect(module.state.eventTypes).toEqual(entity);
      });
    });

    describe('setAgreementTypesFetched', () => {
      test('the setAgreementTypesFetched mutation sets the agreementTypesFetched state', () => {
        module.mutations.setAgreementTypesFetched(module.state, true);
        expect(module.state.agreementTypesFetched).toBeTruthy();
        module.mutations.setAgreementTypesFetched(module.state, false);
        expect(module.state.agreementTypesFetched).toBeFalsy();
      });
    });

    describe('setGetLoading', () => {
      test('the setGetLoading mutation sets the getLoading state', () => {
        module.mutations.setGetLoading(module.state, true);
        expect(module.state.getLoading).toBeTruthy();
        module.mutations.setGetLoading(module.state, false);
        expect(module.state.getLoading).toBeFalsy();
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        module.mutations.setSearchLoading(module.state, true);
        expect(module.state.searchLoading).toBeTruthy();
        module.mutations.setSearchLoading(module.state, false);
        expect(module.state.searchLoading).toBeFalsy();
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchAgreementTypes', () => {
      it('calls the getAgreementTypes service and returns the eventTypes getter', async () => {
        module.state.agreementTypesFetched = false;
        module.optionsService.getOptionList = jest.fn();
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        const res = await module.actions.fetchAgreementTypes(actionContext);
        expect(module.optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.AgreementTypes);
        expect(actionContext.commit).toBeCalledWith('setAgreementTypes', res);
        expect(actionContext.commit).toBeCalledWith('setAgreementTypesFetched', true);
      });

      test('if the getEventTypes action has already been called it will not call the service again', async () => {
        module.state.agreementTypesFetched = true;
        module.optionsService.getOptionList = jest.fn();
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        await module.actions.fetchAgreementTypes(actionContext);
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
      });
    });

    describe('fetchEventTypes', () => {
      it('calls the getEventsTypes service and returns the eventTypes getter', async () => {
        module.state.eventTypesFetched = false;
        module.optionsService.getOptionList = jest.fn();
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        const res = await module.actions.fetchEventTypes(actionContext);
        expect(module.optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.EventTypes);
        expect(actionContext.commit).toBeCalledWith('setEventTypes', res);
        expect(actionContext.commit).toBeCalledWith('setEventTypesFetched', true);
      });

      test('if the getEventTypes action has already been called it will not call the service again', async () => {
        module.state.eventTypesFetched = true;
        module.optionsService.getOptionList = jest.fn();
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
        await module.actions.fetchEventTypes(actionContext);
        expect(module.optionsService.getOptionList).toHaveBeenCalledTimes(0);
      });
    });

    describe('fetchOtherProvinces', () => {
      it('calls the fetchOtherProvinces() function', async () => {
        module.service.getOtherProvinces = jest.fn();
        expect(module.service.getOtherProvinces).toHaveBeenCalledTimes(0);
        await module.actions.fetchOtherProvinces();
        expect(module.service.getOtherProvinces).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchRegions', () => {
      it('calls the fetchRegions() function', async () => {
        module.service.getRegions = jest.fn();
        expect(module.service.getRegions).toHaveBeenCalledTimes(0);
        await module.actions.fetchRegions();
        expect(module.service.getRegions).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateEventSection', () => {
      it('calls the addCallCentre service and returns the new Event entity, if section is call centre and action is add', async () => {
        const event = mockEventEntity();
        module.service.addCallCentre = jest.fn(() => Promise.resolve(event));
        const callCentre = event.callCentres[0];
        expect(module.service.addCallCentre).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
        });

        expect(res).toEqual(event);
        expect(module.service.addCallCentre).toHaveBeenCalledTimes(1);
        expect(module.service.addCallCentre).toHaveBeenCalledWith(event.id, callCentre);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the editCallCentre service and returns the new Event entity, if section is call centre and action is edit', async () => {
        const event = mockEventEntity();
        module.service.editCallCentre = jest.fn(() => Promise.resolve(event));
        const callCentre = event.callCentres[0];
        expect(module.service.editCallCentre).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'edit',
        });

        expect(res).toEqual(event);
        expect(module.service.editCallCentre).toHaveBeenCalledTimes(1);
        expect(module.service.editCallCentre).toHaveBeenCalledWith(event.id, callCentre);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it(' calls the addAgreement service and returns the new Event entity, if section is agreement and action is add', async () => {
        const event = mockEventEntity();
        const agreement = { ...event.agreements[0] };
        module.service.addAgreement = jest.fn(() => Promise.resolve(event));
        expect(module.service.addAgreement).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'add',
        });

        expect(module.service.addAgreement).toHaveBeenCalledTimes(1);
        expect(module.service.addAgreement).toHaveBeenCalledWith(event.id, agreement);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the editAgreement service and returns the new Event entity, if  section is agreement and action is edit,', async () => {
        const event = mockEventEntity();
        const agreement = { ...event.agreements[0] };
        module.service.editAgreement = jest.fn(() => Promise.resolve(event));
        expect(module.service.editAgreement).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(actionContext, {
          eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'edit',
        });

        expect(res).toEqual(event);
        expect(module.service.editAgreement).toHaveBeenCalledTimes(1);
        expect(module.service.editAgreement).toHaveBeenCalledWith(event.id, agreement);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });

      it('calls the addRegistrationLocation service and returns the new Event entity, if section is registration location and action is add',
        async () => {
          const event = mockEventEntity();
          const location = event.registrationLocations[0];
          module.service.addRegistrationLocation = jest.fn(() => Promise.resolve(event));
          expect(module.service.addRegistrationLocation).toHaveBeenCalledTimes(0);

          const res = await module.actions.updateEventSection(actionContext, {
            eventId: event.id, payload: location, section: EEventSummarySections.RegistrationLocation, action: 'add',
          });

          expect(module.service.addRegistrationLocation).toHaveBeenCalledTimes(1);
          expect(module.service.addRegistrationLocation).toHaveBeenCalledWith(event.id, location);
          expect(actionContext.commit).toBeCalledWith('set', event);
          expect(res).toEqual(event);
        });

      it('calls the editRegistrationLocation service and returns the new Event entity', async () => {
        const event = mockEventEntity();
        const location = event.registrationLocations[0];

        module.service.editRegistrationLocation = jest.fn(() => Promise.resolve(event));
        expect(module.service.editRegistrationLocation).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(actionContext, {
          eventId: event.id,
          payload: location,
          section: EEventSummarySections.RegistrationLocation,
          action: 'edit',
        });

        expect(module.service.editRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(module.service.editRegistrationLocation).toHaveBeenCalledWith(event.id, location);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });

      it('calls the addShelterLocation service and returns the new Event entity,if section is shelter location and action is add', async () => {
        const event = mockEventEntity();
        const location = event.shelterLocations[0];
        module.service.addShelterLocation = jest.fn(() => Promise.resolve(event));
        expect(module.service.addShelterLocation).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(
          actionContext,
          {
            eventId: event.id,
            payload: location,
            section: EEventSummarySections.ShelterLocation,
            action: 'add',
          },
        );

        expect(module.service.addShelterLocation).toHaveBeenCalledTimes(1);
        expect(module.service.addShelterLocation).toHaveBeenCalledWith(event.id, location);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });

      it('calls the editShelterLocation service and returns the new Event entity,if section is shelter location and action is edit', async () => {
        const event = mockEventEntity();
        const shelterLocation = event.shelterLocations[0];
        module.service.editShelterLocation = jest.fn(() => Promise.resolve(event));
        expect(module.service.editShelterLocation).toHaveBeenCalledTimes(0);

        const res = await module.actions.updateEventSection(
          actionContext,
          {
            eventId: event.id,
            payload: shelterLocation,
            section: EEventSummarySections.ShelterLocation,
            action: 'edit',
          },
        );

        expect(module.service.editShelterLocation).toHaveBeenCalledTimes(1);
        expect(module.service.editShelterLocation).toHaveBeenCalledWith(event.id, shelterLocation);
        expect(actionContext.commit).toBeCalledWith('set', event);
        expect(res).toEqual(event);
      });
    });

    describe('deleteAgreement', () => {
      it('calls the removeAgreement service and returns the new Event entity', async () => {
        const event = mockEventEntity();

        const agreementId = event.agreements[0].id;
        module.service.removeAgreement = jest.fn(() => Promise.resolve(event));
        expect(module.service.removeAgreement).toHaveBeenCalledTimes(0);

        const res = await module.actions.deleteAgreement(actionContext, { eventId: event.id, agreementId });

        expect(module.service.removeAgreement).toHaveBeenCalledTimes(1);
        expect(module.service.removeAgreement).toHaveBeenCalledWith(event.id, agreementId);
        expect(res).toEqual(event);
      });
    });

    describe('createEvent', () => {
      it('should call createEvent service with proper params', async () => {
        const payload = {} as IEventEntity;
        const res = {} as IEventEntity;
        module.service.createEvent = jest.fn(() => Promise.resolve(res));
        await module.actions.createEvent(actionContext, payload);

        expect(module.service.createEvent).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('toggleSelfRegistration', () => {
      it('calls the setEventSelfRegistration service', async () => {
        const event = mockEventEntity();
        module.service.toggleSelfRegistration = jest.fn(() => Promise.resolve(event));
        const payload = {
          id: event.id,
          selfRegistrationEnabled: true,
        };
        expect(module.service.toggleSelfRegistration).toHaveBeenCalledTimes(0);

        const res = await module.actions.toggleSelfRegistration(actionContext, payload);

        expect(res).toEqual(event);
        expect(module.service.toggleSelfRegistration).toHaveBeenCalledTimes(1);
        expect(module.service.toggleSelfRegistration).toHaveBeenCalledWith(event.id, true);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('setEventStatus', () => {
      it('calls the setEventStatus service', async () => {
        const event = new EventEntity(mockEventEntity());
        module.service.setEventStatus = jest.fn(() => Promise.resolve(event));
        const payload = {
          event,
          status: EEventStatus.Open,
          reason: 're-open',
        };
        expect(module.service.setEventStatus).toHaveBeenCalledTimes(0);

        const res = await module.actions.setEventStatus(actionContext, payload);

        expect(res).toEqual(event);
        expect(module.service.setEventStatus).toHaveBeenCalledTimes(1);
        expect(module.service.setEventStatus).toHaveBeenCalledWith(event.id, EEventStatus.Open, true, 're-open');
        expect(actionContext.commit).toBeCalledWith('set', event);
      });
    });
  });
});
