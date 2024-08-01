import { IBookingRequest, IdParams } from '@libs/entities-lib/booking-request';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';
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

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IBookingRequest, IEntity>> {
      // try { this.http.get('case-file/search/booking-requests', { params, isOData: true }) } catch {}
      // return { odataCount: 2, value: mockBookingRequests({ householdId: '269162b8-aea7-4bb5-840c-9bc810a449f3',
      // caseFileId: '7a2f59bf-d036-449f-bce9-ed54f8225f42' }).map((b) => ({ entity: b, metadata: b, id: '' })) };
      return this.http.get('case-file/search/booking-requests', { params, isOData: true });
  }
}
