import { mockEventData } from './registrationEvent.mock';
import { RegistrationEvent } from './registrationEvent';

let event = new RegistrationEvent(mockEventData());

describe('>>> Event', () => {
  describe('>> constructor', () => {
    beforeEach(() => {
      event = new RegistrationEvent(mockEventData());
    });

    it('should instantiate id', () => {
      expect(event.id).toBe(mockEventData().id);
    });

    it('should instantiate name', () => {
      expect(event.name).toEqual(mockEventData().name);
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

    it('should instantiate registrationAssessments', () => {
      expect(event.registrationAssessments).toEqual(mockEventData().registrationAssessments);
    });
  });
});
