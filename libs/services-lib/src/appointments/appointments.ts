import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IAppointment } from '@libs/entities-lib/src/appointment/appointment/appointment.types';
import { IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { GlobalHandler, IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IAppointmentsService } from './appointments.types';

const API_URL_SUFFIX = 'appointments';
const ENTITY = 'appointments';

export class AppointmentsService extends DomainBaseService<IAppointment, IdParams>
  implements IAppointmentsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(item: IAppointment): Promise<IAppointment> {
    return this.http.post<IAppointment>(`${this.baseUrl}/${item.id}`, item);
  }

  async update(item: IAppointment): Promise<IAppointment> {
    return this.http.patch<IAppointment>(`${this.baseUrl}/${item.id}`, item, {
      globalHandler: GlobalHandler.Partial,
    });
  }

  async search(params: IAzureSearchParams):
    Promise<IAzureCombinedSearchResult<IAppointment, IEntity>> {
    return this.http.get('appointments/search/appointments', { params, isODataSql: true });
  }
}
