import { ISearchParams, ICombinedSearchResult, Status } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IAppointmentProgram, AppointmentProgram, IdParams, IServiceOption } from '@libs/entities-lib/appointment';
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
    const payload = this.parsePayload(item);
    return this.http.post<IAppointmentProgram>(`${this.baseUrl}/${item.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async update(item: AppointmentProgram): Promise<IAppointmentProgram> {
    const payload = this.parsePayload(item);
    return this.http.patch<IAppointmentProgram>(`${this.baseUrl}/${item.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async delete(id: string): Promise<IAppointmentProgram> {
    return this.http.delete<IAppointmentProgram>(`${this.baseUrl}/${id}`);
  }

  async createServiceOption(appointmentProgramId:string, item: Partial<IServiceOption>): Promise<IAppointmentProgram> {
    return this.http.patch<IAppointmentProgram>(`${API_URL_SUFFIX}/${appointmentProgramId}/service-options`, item);
  }

  async updateServiceOption(appointmentProgramId:string, item: Partial<IServiceOption>): Promise<IAppointmentProgram> {
    return this.http.patch<IAppointmentProgram>(`${API_URL_SUFFIX}/${appointmentProgramId}/service-options/${item.id}`, item);
  }

  async deleteServiceOption(appointmentProgramId:string, itemId: string): Promise<IAppointmentProgram> {
    return this.http.delete<IAppointmentProgram>(`${API_URL_SUFFIX}/${appointmentProgramId}/service-options/${itemId}`);
  }

  async setAppointmentProgramStatus(id: uuid, appointmentProgramStatus: Status, rationale: string): Promise<IAppointmentProgram> {
    return this.http.patch<IAppointmentProgram>(`${API_URL_SUFFIX}/${id}/appointment-program-status`, { appointmentProgramStatus, rationale });
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IAppointmentProgram, IEntity>> {
    return this.http.get('appointment/search/appointment-programs', { params, isOData: true });
  }

  parsePayload(program: AppointmentProgram) {
    // TODO remove this when email message is implemented
    program.emailConfirmationMessage = program.emailConfirmationMessage?.translation?.en ? program.emailConfirmationMessage : { translation: { en: 'mock-message' } };
    program.emailConfirmationSubject = program.emailConfirmationSubject?.translation?.en ? program.emailConfirmationSubject : { translation: { en: 'mock-subject' } };
    program.fillEmptyMultilingualAttributes();
    return program;
  }
}
