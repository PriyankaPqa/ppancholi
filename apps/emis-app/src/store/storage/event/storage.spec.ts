import { EVENT_ENTITIES, EVENT_METADATA } from '@/constants/vuex-modules';
import {
  EEventStatus,
  EventEntity,
  mockEventEntities,
  mockEventEntity,
} from '@libs/entities-lib/event';
import { mockStore } from '@/store';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { EEventSummarySections } from '@/types';
import { EventStorage } from './storage';

const entityModuleName = EVENT_ENTITIES;
const metadataModuleName = EVENT_METADATA;

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        items: mockEventEntities(),
        eventsFetched: true,
        agreementTypes: mockOptionItemData(),
        agreementTypesFetched: true,
        eventTypes: mockOptionItemData(),
        eventTypesFetched: true,
        searchLoading: false,
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new EventStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Event Storage', () => {
  describe('>> Actions', () => {
    it('should proxy fetchAgreementTypes', () => {
      storage.actions.fetchAgreementTypes();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchAgreementTypes`);
    });

    it('should proxy fetchEventTypes', () => {
      storage.actions.fetchEventTypes();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchEventTypes`);
    });

    it('should proxy fetchOtherProvinces', () => {
      storage.actions.fetchOtherProvinces();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchOtherProvinces`);
    });

    it('should proxy fetchRegions', () => {
      storage.actions.fetchRegions();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchRegions`);
    });

    it('should proxy updateEventSection', () => {
      const event = new EventEntity(mockEventEntity());
      const callCentre = event.callCentres[0];
      storage.actions.updateEventSection({
        eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
      });
      expect(store.dispatch).toHaveBeenCalledWith(`${entityModuleName}/updateEventSection`,
        {
          eventId: event.id, payload: callCentre, section: EEventSummarySections.CallCentre, action: 'add',
        });
    });

    it('should proxy deleteAgreement', () => {
      const event = new EventEntity(mockEventEntity());
      const agreementId = event.agreements[0].id;
      storage.actions.deleteAgreement({ eventId: event.id, agreementId });
      expect(store.dispatch).toHaveBeenCalledWith(`${entityModuleName}/deleteAgreement`, { eventId: event.id, agreementId });
    });

    it('should proxy toggleSelfRegistration', () => {
      const event = new EventEntity(mockEventEntities()[0]);
      storage.actions.toggleSelfRegistration({ id: event.id, selfRegistrationEnabled: false });
      expect(store.dispatch).toHaveBeenCalledWith(`${entityModuleName}/toggleSelfRegistration`, {
        id: event.id,
        selfRegistrationEnabled: false,
      });
    });

    it('should proxy setEventStatus', () => {
      const event = new EventEntity(mockEventEntities()[0]);
      storage.actions.setEventStatus({ event, status: EEventStatus.Closed, reason: 'reason' });
      expect(store.dispatch).toHaveBeenCalledWith(`${entityModuleName}/setEventStatus`, {
        event,
        status: EEventStatus.Closed,
        reason: 'reason',
      });
    });
  });

  describe('>> Getters', () => {
    it('should proxy agreementTypes', () => {
      store.commit(`${entityModuleName}/agreementTypes`, mockOptionItemData());
      const storageGetter = storage.getters.agreementTypes();
      const storeGetter = store.getters[`${entityModuleName}/agreementTypes`]();
      expect(storageGetter).toEqual(storeGetter);
    });

    it('should proxy eventTypes', () => {
      store.commit(`${entityModuleName}/setEventTypes`, mockOptionItemData());
      const storageGetter = storage.getters.eventTypes();
      const storeGetter = store.getters[`${entityModuleName}/eventTypes`]();
      expect(storageGetter).toEqual(storeGetter);
    });

    describe('>> eventsByStatus', () => {
      it('should proxy eventsByStatus with populated status array', () => {
        store.commit(`${entityModuleName}/setAll`, mockEventEntities());
        const storageGetter = storage.getters.eventsByStatus([EEventStatus.Open]);
        const storeGetter = store.getters[`${entityModuleName}/eventsByStatus`](([EEventStatus.Open]));
        expect(storageGetter).toEqual(storeGetter);
      });

      it('should proxy eventsByStatus with empty status array', () => {
        store.commit(`${entityModuleName}/setAll`, mockEventEntities());
        const storageGetter = storage.getters.eventsByStatus([]);
        const storeGetter = store.getters[`${entityModuleName}/eventsByStatus`]([]);
        expect(storageGetter).toEqual(storeGetter);
      });
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setAgreementTypesFetched', () => {
      const payload = true;
      storage.mutations.setAgreementTypesFetched(payload);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setAgreementTypesFetched`, payload);
    });

    it('should proxy setEventTypesFetched', () => {
      const payload = true;
      storage.mutations.setEventTypesFetched(payload);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setEventTypesFetched`, payload);
    });
  });
});
