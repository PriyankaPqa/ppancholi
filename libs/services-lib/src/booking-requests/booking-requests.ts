import { IBookingRequest, IdParams, IBooking } from '@libs/entities-lib/booking-request';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';
import { CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { IEntity } from '@libs/entities-lib/src/base';
import { IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IBookingRequestsService } from './booking-requests.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'booking-requests';

export class BookingRequestsService extends DomainBaseService<IBookingRequest, IdParams>
  implements IBookingRequestsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async createBookingRequest(item: IBookingRequest): Promise<IBookingRequest> {
    return this.http.post<IBookingRequest>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }

  async fulfillBooking(item: IBookingRequest, paymentId: string, bookings: IBooking[]): Promise<IBookingRequest> {
    return this.http.post<IBookingRequest>(
      this.getItemUrl(`${this.baseUrl}/fulfill`, item),
      this.parseFulFillBooking(item, paymentId, bookings),
    );
  }

  parseFulFillBooking(item: IBookingRequest, paymentId: string, bookings: IBooking[]) {
    return {
      bookingRequestId: item.id,
      paymentIds: paymentId ? [paymentId] : [],
      bookings: bookings.map((b) => ({
        peopleInRoom: b.peopleInRoom,
        address: CurrentAddress.parseCurrentAddress(b.address),
      })),
    };
  }

  async rejectBooking(item: IBookingRequest, rationale: string): Promise<IBookingRequest> {
    return this.http.patch<IBookingRequest>(this.getItemUrl(`${this.baseUrl}/{id}/reject`, item), { rationale });
  }

  async search(params: ISearchParams & { forManagement?: boolean }, searchEndpoint?: string, forManagement = false):
    Promise<ICombinedSearchResult<IBookingRequest, IEntity>> {
      return this.http.get(`case-file/search/booking-requests?forManagement=${params.forManagement || forManagement}`, { params, isOData: true });
  }
}
