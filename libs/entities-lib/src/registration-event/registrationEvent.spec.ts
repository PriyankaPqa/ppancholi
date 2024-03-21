import { mockEventSummary } from '../event';
import { RegistrationEvent } from './registrationEvent';

let event = new RegistrationEvent(mockEventSummary());

describe('>>> Event', () => {
  describe('>> constructor', () => {
    beforeEach(() => {
      event = new RegistrationEvent(mockEventSummary());
    });

    it('should instantiate id', () => {
      expect(event.id).toBe(mockEventSummary().id);
    });

    it('should instantiate name', () => {
      expect(event.name).toEqual(mockEventSummary().name);
    });

    it('should instantiate registration link', () => {
      expect(event.registrationLink).toEqual(mockEventSummary().registrationLink);
    });

    it('should instantiate tenantId', () => {
      expect(event.tenantId).toEqual(mockEventSummary().tenantId);
    });

    it('should instantiate shelterLocations', () => {
      expect(event.shelterLocations).toEqual(mockEventSummary().shelterLocations);
    });

    it('should instantiate registrationLocations', () => {
      expect(event.registrationLocations).toEqual(mockEventSummary().registrationLocations);
    });

    it('should instantiate schedule', () => {
      expect(event.schedule).toEqual(mockEventSummary().schedule);
    });

    it('should instantiate selfRegistrationEnabled', () => {
      expect(event.selfRegistrationEnabled).toEqual(mockEventSummary().selfRegistrationEnabled);
    });

    it('should instantiate registrationAssessments', () => {
      expect(event.registrationAssessments).toEqual(mockEventSummary().registrationAssessments);
    });
    it('should instantiate consentStatementId', () => {
      expect(event.consentStatementId).toBe(mockEventSummary().consentStatementId);
    });
  });
});
