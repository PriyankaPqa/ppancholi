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

  async search(params: ISearchParams): Promise<ICombinedSearchResult<IBookingRequest, IEntity>> {
    return this.http.get('case-file/search/booking-requests', { params, isOData: true });
  }
}
