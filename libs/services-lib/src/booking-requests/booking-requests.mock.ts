import { mockBookingRequests, mockBookingRequest } from '@libs/entities-lib/booking-request';
import { mockDomainBaseService } from '../base';
import { IBookingRequestsServiceMock } from './booking-requests.types';

export const mockBookingRequestsService = (): IBookingRequestsServiceMock => ({
  ...mockDomainBaseService(mockBookingRequests()),
  createBookingRequest: jest.fn(() => mockBookingRequest()),
  fulfillBooking: jest.fn(() => mockBookingRequest()),
});
