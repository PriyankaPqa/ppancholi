import {
  Event, IEventAgreementInfos, IEventCallCentre, IEventGenericLocation, mockEventsSearchData, EEventStatus,
} from '@/entities/event';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Event Storage', () => {
  describe('>> Getters', () => {
    it('should proxy agreementTypes', () => {
      expect(storage.getters.eventTypes()).toEqual(store.getters['event/agreementTypes']);
    });

    it('should proxy eventTypes', () => {
      expect(storage.getters.eventTypes()).toEqual(store.getters['event/eventTypes']);
    });

    it('should proxy events', () => {
      expect(storage.getters.events()).toEqual(store.getters['event/events']);
    });

    it('should proxy openEvents', () => {
      expect(storage.getters.openEvents()).toEqual(store.getters['event/openEvents']);
    });

    it('should proxy eventById', () => {
      expect(storage.getters.eventById('TEST_ID')).toEqual(store.getters['event/eventById']('TEST_ID'));
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchAgreementTypes', () => {
      storage.actions.fetchAgreementTypes();
      expect(store.dispatch).toBeCalledWith('event/fetchAgreementTypes');
    });

    it('should proxy fetchEventTypes', () => {
      storage.actions.fetchEventTypes();
      expect(store.dispatch).toBeCalledWith('event/fetchEventTypes');
    });

    it('should proxy fetchEvent', () => {
      storage.actions.fetchEvent('TEST_ID');
      expect(store.dispatch).toBeCalledWith('event/fetchEvent', 'TEST_ID');
    });

    it('should proxy fetchEvents', () => {
      storage.actions.fetchEvents();
      expect(store.dispatch).toBeCalledWith('event/fetchEvents');
    });

    it('should proxy fetchOtherProvinces', () => {
      storage.actions.fetchOtherProvinces();
      expect(store.dispatch).toBeCalledWith('event/fetchOtherProvinces');
    });

    it('should proxy fetchRegions', () => {
      storage.actions.fetchRegions();
      expect(store.dispatch).toBeCalledWith('event/fetchRegions');
    });

    it('should proxy searchEvents', () => {
      const params = mockSearchParams;
      storage.actions.searchEvents(params);
      expect(store.dispatch).toBeCalledWith('event/searchEvents', params);
    });

    it('should proxy createEvent', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.createEvent(event);
      expect(store.dispatch).toHaveBeenCalledWith('event/createEvent', event);
    });

    it('should proxy updateEvent', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.updateEvent(event);
      expect(store.dispatch).toHaveBeenCalledWith('event/updateEvent', event);
    });

    it('should proxy addCallCentre', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const callCentre = event.callCentres[0];
      storage.actions.addCallCentre({ eventId: event.id, payload: callCentre });
      expect(store.dispatch).toHaveBeenCalledWith('event/addCallCentre', { eventId: event.id, payload: callCentre });
    });

    it('should proxy editCallCentre', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const callCentre1 = event.callCentres[0];
      const callCentre2 = { ...callCentre1, startDate: null } as IEventCallCentre;
      const payload = { originalCallCentre: callCentre1, updatedCallCentre: callCentre2 };
      storage.actions.editCallCentre({ eventId: event.id, payload });
      expect(store.dispatch).toHaveBeenCalledWith('event/editCallCentre', { eventId: event.id, payload });
    });

    it('should proxy addAgreement', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const agreement = event.agreements[0];
      storage.actions.addAgreement({ eventId: event.id, payload: agreement });
      expect(store.dispatch).toHaveBeenCalledWith('event/addAgreement', { eventId: event.id, payload: agreement });
    });

    it('should proxy editAgreement', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const agreement1 = event.agreements[0];
      const agreement2 = { ...agreement1, startDate: null } as IEventAgreementInfos;
      const payload = { originalAgreement: agreement1, updatedAgreement: agreement2 };
      storage.actions.editAgreement({ eventId: event.id, payload });
      expect(store.dispatch).toHaveBeenCalledWith('event/editAgreement', { eventId: event.id, payload });
    });

    it('should proxy deleteAgreement', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const agreement = event.agreements[0];
      storage.actions.deleteAgreement({ eventId: event.id, payload: agreement });
      expect(store.dispatch).toHaveBeenCalledWith('event/deleteAgreement', { eventId: event.id, payload: agreement });
    });

    it('should proxy addRegistrationLocation', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const location = event.registrationLocations[0];
      storage.actions.addRegistrationLocation({ eventId: event.id, payload: location });
      expect(store.dispatch).toHaveBeenCalledWith('event/addRegistrationLocation', { eventId: event.id, payload: location });
    });

    it('should proxy editRegistrationLocation', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const originalRegistrationLocation = event.registrationLocations[0];
      const updatedRegistrationLocation = {
        ...originalRegistrationLocation,
        address: {
          city: 'Laval',
        },
      } as IEventGenericLocation;
      const payload = { originalRegistrationLocation, updatedRegistrationLocation };

      storage.actions.editRegistrationLocation({ eventId: event.id, payload });
      expect(store.dispatch).toHaveBeenCalledWith('event/editRegistrationLocation', { eventId: event.id, payload });
    });

    it('should proxy addShelterLocation', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const location = event.shelterLocations[0];
      storage.actions.addShelterLocation({ eventId: event.id, payload: location });
      expect(store.dispatch).toHaveBeenCalledWith('event/addShelterLocation', { eventId: event.id, payload: location });
    });

    it('should proxy editShelterLocation', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const originalShelterLocation = event.shelterLocations[0];
      const updatedShelterLocation = {
        ...originalShelterLocation,
        address: {
          city: 'Laval',
        },
      } as IEventGenericLocation;
      const payload = { originalShelterLocation, updatedShelterLocation };

      storage.actions.editShelterLocation({ eventId: event.id, payload });
      expect(store.dispatch).toHaveBeenCalledWith('event/editShelterLocation', { eventId: event.id, payload });
    });

    it('should proxy toggleSelfRegistration', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.toggleSelfRegistration({ id: event.id, selfRegistrationEnabled: false });
      expect(store.dispatch).toHaveBeenCalledWith('event/toggleSelfRegistration', {
        id: event.id,
        selfRegistrationEnabled: false,
      });
    });

    it('should proxy setEventStatus', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.setEventStatus({ event, status: EEventStatus.Closed, reason: 'reason' });
      expect(store.dispatch).toHaveBeenCalledWith('event/setEventStatus', {
        event,
        status: EEventStatus.Closed,
        reason: 'reason',
      });
    });
  });
});
