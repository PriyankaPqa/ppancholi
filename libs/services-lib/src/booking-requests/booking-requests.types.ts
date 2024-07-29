import { IBookingRequest } from '@libs/entities-lib/booking-request';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IBookingRequestsService extends IDomainBaseService<IBookingRequest, { id: uuid, caseFileId: uuid }> {
  createBookingRequest(item: IBookingRequest): Promise<IBookingRequest>;
}

export interface IBookingRequestsServiceMock extends IDomainBaseServiceMock<IBookingRequest> {
  createBookingRequest: jest.Mock<IBookingRequest>;
}
