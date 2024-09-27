import { IBookingRequest, IBooking } from '@libs/entities-lib/booking-request';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/src/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IBookingRequestsService extends IDomainBaseService<IBookingRequest, { id: uuid, caseFileId: uuid }> {
  createBookingRequest(item: IBookingRequest): Promise<IBookingRequest>;
  fulfillBooking(item: IBookingRequest, paymentId: string, bookings: IBooking[]): Promise<IBookingRequest>;
  rejectBooking(item: IBookingRequest, rationale: string): Promise<IBookingRequest>;
  search(params: ISearchParams & { forManagement?: boolean }, searchEndpoint?: string, forManagement?: boolean):
    Promise<ICombinedSearchResult<IBookingRequest, IEntity>>
}

export interface IBookingRequestsServiceMock extends IDomainBaseServiceMock<IBookingRequest> {
  createBookingRequest: jest.Mock<IBookingRequest>;
  fulfillBooking: jest.Mock<IBookingRequest>;
  rejectBooking: jest.Mock<IBookingRequest>;
}
