import { ISearchParams, ICombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IAppointmentProgram, AppointmentProgram, IdParams } from '@libs/entities-lib/appointment';
import { GlobalHandler, IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IAppointmentProgramsService } from './appointment-programs.types';

const API_URL_SUFFIX = 'appointment';
const ENTITY = 'appointment-programs';

export class AppointmentProgramsService extends DomainBaseService<IAppointmentProgram, IdParams>
  implements IAppointmentProgramsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(item: AppointmentProgram): Promise<IAppointmentProgram> {
    item.fillEmptyMultilingualAttributes();
    return this.http.post<IAppointmentProgram>(`${this.baseUrl}/${item.id}`, item, { globalHandler: GlobalHandler.Partial });
  }

  async update(item: IAppointmentProgram): Promise<IAppointmentProgram> {
    return this.http.patch<IAppointmentProgram>(`${this.baseUrl}/${item.id}`, item, {
      globalHandler: GlobalHandler.Partial,
    });
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IAppointmentProgram, IEntity>> {
    return this.http.get('appointments/search/appointment-programs', { params, isOData: true });
  }
}
