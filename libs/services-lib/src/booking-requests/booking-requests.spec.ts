import { mockBookingRequest } from '@libs/entities-lib/booking-request';
import { mockTemporaryAddress } from '@libs/entities-lib/src/case-file-individual';
import { CurrentAddress } from '@libs/entities-lib/src/household-create';
import { GlobalHandler, IHttpMock, mockHttp } from '../http-client';
import { BookingRequestsService } from './booking-requests';

describe('>>> Booking request Service', () => {
  let http: IHttpMock;
  let service: BookingRequestsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new BookingRequestsService(http as never);
  });

  describe('get', () => {
    it('is linked to the correct URL and params', async () => {
      const id = { id: 'myId', caseFileId: 'myParent' };
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/booking-requests/myId', { globalHandler: GlobalHandler.Enabled });
    });
  });

  describe('createBookingRequest', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockBookingRequest();
      entity.caseFileId = 'myParent';
      await service.createBookingRequest(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/booking-requests', entity);
    });
  });

  describe('fulfillBooking', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockBookingRequest();
      entity.caseFileId = 'myParent';
      const bookings = [{ peopleInRoom: ['a'], address: mockTemporaryAddress() }, { peopleInRoom: ['b'], address: mockTemporaryAddress() }] as any;
      await service.fulfillBooking(entity, 'payid', bookings);
      expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/booking-requests/fulfill', {
        bookingRequestId: entity.id,
        paymentIds: ['payid'],
        bookings: [{ peopleInRoom: ['a'], address: CurrentAddress.parseCurrentAddress(mockTemporaryAddress()) },
          { peopleInRoom: ['b'], address: CurrentAddress.parseCurrentAddress(mockTemporaryAddress()) }],
      });
    });
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/booking-requests', { params, isOData: true });
    });
  });
});
