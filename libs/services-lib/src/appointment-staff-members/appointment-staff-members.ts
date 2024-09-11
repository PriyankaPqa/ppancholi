import { ISearchParams, ICombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IAppointmentStaffMember } from '@libs/entities-lib/src/appointment';
import { IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IAppointmentStaffMembersService } from './appointment-staff-members.types';

const API_URL_SUFFIX = 'appointments';
const ENTITY = 'staff-members';

export class AppointmentStaffMembersService extends DomainBaseService<IAppointmentStaffMember, IdParams>
  implements IAppointmentStaffMembersService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async assignStaffMembers(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]): Promise<IAppointmentStaffMember[]> {
    return this.http.patch<IAppointmentStaffMember[]>(`${this.baseUrl}/${appointmentProgramId}`, staffMembers);
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IAppointmentStaffMember, IEntity>> {
    return this.http.get('appointments/search/staff-members', { params, isOData: true });
  }
}
