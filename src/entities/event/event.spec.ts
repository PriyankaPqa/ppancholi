import { mockEventData } from './event.mock';
import { Event } from './event';

let event = new Event(mockEventData());

describe('>>> Event', () => {
  describe('>> constructor', () => {
    beforeEach(() => {
      event = new Event(mockEventData());
    });

    it('should instantiate id', () => {
      expect(event.id).toBe(mockEventData().eventId);
    });

    it('should instantiate name', () => {
      expect(event.name).toEqual(mockEventData().eventName);
    });

    it('should instantiate registration link', () => {
      expect(event.registrationLink).toEqual(mockEventData().registrationLink);
    });

    it('should instantiate tenantId', () => {
      expect(event.tenantId).toEqual(mockEventData().tenantId);
    });

    it('should instantiate shelterLocations', () => {
      expect(event.shelterLocations).toEqual(mockEventData().shelterLocations);
    });

    it('should instantiate registrationLocations', () => {
      expect(event.registrationLocations).toEqual(mockEventData().registrationLocations);
    });

    it('should instantiate schedule', () => {
      expect(event.schedule).toEqual(mockEventData().schedule);
    });

    it('should instantiate selfRegistrationEnabled', () => {
      expect(event.selfRegistrationEnabled).toEqual(mockEventData().selfRegistrationEnabled);
    });
  });
});
