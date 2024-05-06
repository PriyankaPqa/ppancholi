import {
  mockEventEntities,
  mockEventEntity,
  mockOtherProvinceData,
  mockRegionData,
} from '@libs/entities-lib/event';
import { mockDomainBaseService } from '../../base';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  ...mockDomainBaseService(mockEventEntities()),
  createEvent: jest.fn(() => mockEventEntity()),
  updateEvent: jest.fn(() => mockEventEntity()),
  toggleSelfRegistration: jest.fn(() => mockEventEntity()),
  toggleAssessmentsForL0Users: jest.fn(() => mockEventEntity()),
  toggleRegistrationForL0Users: jest.fn(() => mockEventEntity()),
  toggleAppointmentBookingForL0Users: jest.fn(() => mockEventEntity()),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
  setEventStatus: jest.fn(() => mockEventEntity()),
  addCallCentre: jest.fn(() => mockEventEntity()),
  editCallCentre: jest.fn(() => mockEventEntity()),
  addAgreement: jest.fn(() => mockEventEntity()),
  editAgreement: jest.fn(() => mockEventEntity()),
  removeAgreement: jest.fn(() => mockEventEntity()),
  updateExceptionalAuthenticationType: jest.fn(() => mockEventEntity()),
  addRegistrationLocation: jest.fn(() => mockEventEntity()),
  editRegistrationLocation: jest.fn(() => mockEventEntity()),
  addRegistrationAssessment: jest.fn(() => mockEventEntity()),
  editRegistrationAssessment: jest.fn(() => mockEventEntity()),
  removeRegistrationAssessment: jest.fn(() => mockEventEntity()),
  addShelterLocation: jest.fn(() => mockEventEntity()),
  editShelterLocation: jest.fn(() => mockEventEntity()),
  editEventConsent: jest.fn(() => mockEventEntity()),
  searchMyEvents: jest.fn(),
  searchMyEventsById: jest.fn(),
});
