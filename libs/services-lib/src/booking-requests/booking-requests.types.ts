import { IBookingRequest, IBooking } from '@libs/entities-lib/booking-request';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IBookingRequestsService extends IDomainBaseService<IBookingRequest, { id: uuid, caseFileId: uuid }> {
  createBookingRequest(item: IBookingRequest): Promise<IBookingRequest>;
  fulfillBooking(item: IBookingRequest, paymentId: string, bookings: IBooking[]): Promise<IBookingRequest>;
}

export interface IBookingRequestsServiceMock extends IDomainBaseServiceMock<IBookingRequest> {
  createBookingRequest: jest.Mock<IBookingRequest>;
  fulfillBooking: jest.Mock<IBookingRequest>;
}
