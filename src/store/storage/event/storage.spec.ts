import { Event, mockEventsSearchData, EEventStatus } from '@/entities/event';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { EEventSummarySections } from '@/types';
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

    it('should proxy eventsByStatus', () => {
      expect(storage.getters.eventsByStatus([])).toEqual(store.getters['event/eventsByStatus']([]));
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

    it('should proxy updateEventSection', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const callCentre = event.callCentres[0];
      storage.actions.updateEventSection({
        eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
      });
      expect(store.dispatch).toHaveBeenCalledWith('event/updateEventSection',
        {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
        });
    });

    it('should proxy deleteAgreement', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const agreementId = event.agreements[0].id;
      storage.actions.deleteAgreement({ eventId: event.id, agreementId });
      expect(store.dispatch).toHaveBeenCalledWith('event/deleteAgreement', { eventId: event.id, agreementId });
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
