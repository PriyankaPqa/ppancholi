import { ISearchParams, ICombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IAppointment, IAppointmentRequest } from '@libs/entities-lib/src/appointment/appointment/appointment.types';
import { IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { GlobalHandler, IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IAppointmentsService } from './appointments.types';

const API_URL_SUFFIX = 'appointment';
const ENTITY = 'appointments';

export class AppointmentsService extends DomainBaseService<IAppointment, IdParams>
  implements IAppointmentsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(payload: IAppointmentRequest): Promise<IAppointment> {
    return this.http.post<IAppointment>(this.baseUrl, payload);
  }

  async update(item: IAppointment): Promise<IAppointment> {
    return this.http.patch<IAppointment>(`${this.baseUrl}/${item.id}`, item, {
      globalHandler: GlobalHandler.Partial,
    });
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IAppointment, IEntity>> {
    return this.http.get('appointments/search/appointments', { params, isOData: true });
  }
}
