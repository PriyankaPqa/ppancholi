import { mockEventsService } from '@libs/services-lib/events/entity';
import { mockOptionItemsServiceService } from '@libs/services-lib/optionItems';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { mockSignalR } from '@libs/shared-lib/signal-r';
import { getExtensionComponents } from '@/pinia/event/event-extension';
import { Entity } from '@/pinia/event/event';
import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import _sortBy from 'lodash/sortBy';
import { Status } from '@libs/entities-lib/base';
import {
  EEventStatus, EventEntity, IEventEntity, mockEventEntities, mockEventEntity, IdParams,
} from '@libs/entities-lib/event';
import helpers from '@/ui/helpers/helpers';
import { EEventSummarySections } from '@/types';

const entityService = mockEventsService();
const optionsService = mockOptionItemsServiceService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService, mockSignalR());

const mockAgreementTypes = mockOptionItemData().map((e) => new OptionItem(e));
const mockEventTypes = mockOptionItemData().map((e) => new OptionItem(e));

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-event': {
        items: mockEventEntities(),
        agreementTypes: mockAgreementTypes,
        eventTypes: mockEventTypes,
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useEventTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useEventStore = defineStore('test-event', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useEventStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useEventTestStore(bComponents);
  return store;
};

describe('>>> Event Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgreementTypes', () => {
    it('returns an array of agreementTypes sorted by orderRank and filtered by status', () => {
      const store = createTestStore();
      const res = store.getAgreementTypes();
      expect(res)
        .toEqual(
          _sortBy(mockAgreementTypes, 'orderRank')
            .filter((i) => i.status === Status.Active),
        );
    });
  });

  describe('getEventTypes', () => {
    it('returns an array of EventTypes sorted by orderRank and filtered by status', () => {
      const store = createTestStore();
      const res = store.getEventTypes();
      expect(res)
        .toEqual(
          _sortBy(mockEventTypes, 'orderRank')
            .filter((i) => i.status === Status.Active),
        );
    });
  });

  describe('getEventsByStatus', () => {
    it('returns an array of Events sorted by name and filtered by statuses', () => {
      const store = createTestStore();
      const res = store.getEventsByStatus([EEventStatus.Open]);
      const activeEvents = mockEventEntities()
        .filter((ee) => ee.schedule.status === EEventStatus.Open);
      const sortedActiveEvents = helpers.sortMultilingualArray(activeEvents, 'name');

      expect(JSON.stringify(res))
        .toEqual(JSON.stringify(sortedActiveEvents));
    });
  });

  describe('setAgreementTypes', () => {
    it('sets the agreement types array', () => {
      const store = createTestStore();
      const entity = mockOptionItemData();
      store.setAgreementTypes(entity);
      expect(store.agreementTypes)
        .toEqual(entity);
    });
  });

  describe('setEventTypes', () => {
    it('sets the agreement types array', () => {
      const store = createTestStore();
      const entity = mockOptionItemData();
      store.setEventTypes(entity);
      expect(store.eventTypes)
        .toEqual(entity);
    });
  });

  describe('setAgreementTypesFetched', () => {
    it('should sets the agreementTypesFetched state', () => {
      const store = createTestStore();
      store.setAgreementTypesFetched(true);
      expect(store.agreementTypesFetched)
        .toBeTruthy();
      store.setAgreementTypesFetched(false);
      expect(store.agreementTypesFetched)
        .toBeFalsy();
    });
  });

  describe('setEventTypesFetched', () => {
    it('should sets the eventTypesFetched state', () => {
      const store = createTestStore();
      store.setEventTypesFetched(true);
      expect(store.eventTypesFetched)
        .toBeTruthy();
      store.setEventTypesFetched(false);
      expect(store.eventTypesFetched)
        .toBeFalsy();
    });
  });

  describe('fetchAgreementTypes', () => {
    it('calls the getAgreementTypes service and returns the eventTypes getter', async () => {
      const store = createTestStore();
      store.agreementTypesFetched = false;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchAgreementTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.AgreementTypes);
      expect(store.agreementTypesFetched).toEqual(true);
      expect(store.agreementTypes).toEqual(mockOptionItemData());
    });

    test('if the getEventTypes action has already been called it will not call the service again', async () => {
      const store = createTestStore();
      store.agreementTypesFetched = true;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchAgreementTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
    });
  });

  describe('fetchEventTypes', () => {
    it('calls the getEventsTypes service and returns the eventTypes getter', async () => {
      const store = createTestStore();
      store.eventTypesFetched = false;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchEventTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.EventTypes);
      expect(store.eventTypesFetched).toEqual(true);
      expect(store.eventTypes).toEqual(mockOptionItemData());
    });

    test('if the getEventTypes action has already been called it will not call the service again', async () => {
      const store = createTestStore();
      store.eventTypesFetched = true;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchEventTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
    });
  });

  describe('fetchOtherProvinces', () => {
    it('calls the fetchOtherProvinces() function', async () => {
      const store = createTestStore();
      expect(entityService.getOtherProvinces).toHaveBeenCalledTimes(0);
      await store.fetchOtherProvinces();
      expect(entityService.getOtherProvinces).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchRegions', () => {
    it('calls the fetchRegions() function', async () => {
      const store = createTestStore();
      expect(entityService.getRegions).toHaveBeenCalledTimes(0);
      await store.fetchRegions();
      expect(entityService.getRegions).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateEventSection', () => {
    it('calls the addCallCentre service and returns the new Event entity, if section is call centre and action is add', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const callCentre = event.callCentres[0];
      expect(entityService.addCallCentre).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection({
        eventId: event.id,
        payload: callCentre,
        section: EEventSummarySections.CallCentre,
        action: 'add',
      });

      expect(entityService.addCallCentre).toHaveBeenCalledTimes(1);
      expect(entityService.addCallCentre).toHaveBeenCalledWith(event.id, callCentre);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it('calls the editCallCentre service and returns the new Event entity, if section is call centre and action is edit', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const callCentre = event.callCentres[0];
      expect(entityService.editCallCentre).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection({
        eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'edit',
      });

      expect(entityService.editCallCentre).toHaveBeenCalledTimes(1);
      expect(entityService.editCallCentre).toHaveBeenCalledWith(event.id, callCentre);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it(' calls the addAgreement service and returns the new Event entity, if section is agreement and action is add', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const agreement = { ...event.agreements[0] };
      expect(entityService.addAgreement).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection({
        eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'add',
      });

      expect(entityService.addAgreement).toHaveBeenCalledTimes(1);
      expect(entityService.addAgreement).toHaveBeenCalledWith(event.id, agreement);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it('calls the editAgreement service and returns the new Event entity, if  section is agreement and action is edit,', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const agreement = { ...event.agreements[0] };
      expect(entityService.editAgreement).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection({
        eventId: event.id, payload: agreement, section: EEventSummarySections.Agreement, action: 'edit',
      });

      expect(entityService.editAgreement).toHaveBeenCalledTimes(1);
      expect(entityService.editAgreement).toHaveBeenCalledWith(event.id, agreement);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it(
      'calls the addRegistrationLocation service and returns the new Event entity, if section is registration location and action is add',
      async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const event = mockEventEntity();
        const location = event.registrationLocations[0];
        expect(entityService.addRegistrationLocation).toHaveBeenCalledTimes(0);

        const res = await store.updateEventSection({
          eventId: event.id, payload: location, section: EEventSummarySections.RegistrationLocation, action: 'add',
        });

        expect(entityService.addRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(entityService.addRegistrationLocation).toHaveBeenCalledWith(event.id, location);
        expect(bComponents.set).toBeCalledWith(res);
      },
    );

    it('calls the editRegistrationLocation service and returns the new Event entity', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const location = event.registrationLocations[0];

      expect(entityService.editRegistrationLocation).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection({
        eventId: event.id,
        payload: location,
        section: EEventSummarySections.RegistrationLocation,
        action: 'edit',
      });

      expect(entityService.editRegistrationLocation).toHaveBeenCalledTimes(1);
      expect(entityService.editRegistrationLocation).toHaveBeenCalledWith(event.id, location);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it('calls the addShelterLocation service and returns the new Event entity,if section is shelter location and action is add', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const location = event.shelterLocations[0];
      expect(entityService.addShelterLocation).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection(
        {
          eventId: event.id,
          payload: location,
          section: EEventSummarySections.ShelterLocation,
          action: 'add',
        },
      );

      expect(entityService.addShelterLocation).toHaveBeenCalledTimes(1);
      expect(entityService.addShelterLocation).toHaveBeenCalledWith(event.id, location);
      expect(bComponents.set).toBeCalledWith(res);
    });

    it('calls the editShelterLocation service and returns the new Event entity,if section is shelter location and action is edit', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const event = mockEventEntity();
      const shelterLocation = event.shelterLocations[0];
      expect(entityService.editShelterLocation).toHaveBeenCalledTimes(0);

      const res = await store.updateEventSection(
        {
          eventId: event.id,
          payload: shelterLocation,
          section: EEventSummarySections.ShelterLocation,
          action: 'edit',
        },
      );

      expect(entityService.editShelterLocation).toHaveBeenCalledTimes(1);
      expect(entityService.editShelterLocation).toHaveBeenCalledWith(event.id, shelterLocation);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('deleteAgreement', () => {
    it('calls the removeAgreement service and returns the new Event entity', async () => {
      const event = mockEventEntity();
      const store = createTestStore();

      const agreementId = event.agreements[0].id;
      expect(entityService.removeAgreement).toHaveBeenCalledTimes(0);

      await store.deleteAgreement({ eventId: event.id, agreementId });

      expect(entityService.removeAgreement).toHaveBeenCalledTimes(1);
      expect(entityService.removeAgreement).toHaveBeenCalledWith(event.id, agreementId);
    });
  });

  describe('deleteRegistrationAssessment', () => {
    it('calls the removeRegistrationAssessment service and returns the new Event entity', async () => {
      const event = mockEventEntity();
      const store = createTestStore();

      const registrationAssessmentId = 'myid';
      expect(entityService.removeRegistrationAssessment).toHaveBeenCalledTimes(0);

      await store.deleteRegistrationAssessment({ eventId: event.id, registrationAssessmentId });

      expect(entityService.removeRegistrationAssessment).toHaveBeenCalledTimes(1);
      expect(entityService.removeRegistrationAssessment).toHaveBeenCalledWith(event.id, registrationAssessmentId);
    });
  });

  describe('toggleSelfRegistration', () => {
    it('calls the setEventSelfRegistration service', async () => {
      const event = mockEventEntity();
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {
        id: event.id,
        selfRegistrationEnabled: true,
      };
      expect(entityService.toggleSelfRegistration).toHaveBeenCalledTimes(0);

      const res = await store.toggleSelfRegistration(payload);

      expect(entityService.toggleSelfRegistration).toHaveBeenCalledTimes(1);
      expect(entityService.toggleSelfRegistration).toHaveBeenCalledWith(event.id, true);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('setEventStatus', () => {
    it('calls the setEventStatus service', async () => {
      const event = new EventEntity(mockEventEntity());
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {
        event,
        status: EEventStatus.Open,
        reason: 're-open',
      };
      expect(entityService.setEventStatus).toHaveBeenCalledTimes(0);

      const res = await store.setEventStatus(payload);

      expect(entityService.setEventStatus).toHaveBeenCalledTimes(1);
      expect(entityService.setEventStatus).toHaveBeenCalledWith(event.id, EEventStatus.Open, true, 're-open');
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('createEvent', () => {
    it('should call createEvent service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IEventEntity;

      const res = await store.createEvent(payload);

      expect(entityService.createEvent).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('updateEvent', () => {
    it('should call updateEvent service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IEventEntity;

      const res = await store.updateEvent(payload);

      expect(entityService.updateEvent).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
