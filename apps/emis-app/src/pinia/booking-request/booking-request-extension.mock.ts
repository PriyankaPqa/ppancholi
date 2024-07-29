import { IBookingRequest, mockBookingRequests } from '@libs/entities-lib/booking-request';

export function getExtensionComponents() {
  return {
    createBookingRequest: jest.fn((payload: IBookingRequest) => payload),
    getByCaseFile: jest.fn(() => mockBookingRequests()),
  };
}
