import { ISearchParams, ICombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IDateRange, IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IAppointmentStaffMember, IStaffMemberAvailabilityRequest } from '@libs/entities-lib/src/appointment';
import { IHttpClient } from '../http-client';
import { DomainBaseService } from '../base';
import { IAppointmentStaffMembersService } from './appointment-staff-members.types';

const API_URL_SUFFIX = 'appointment';
const ENTITY = 'appointment-staff-members';

export class AppointmentStaffMembersService extends DomainBaseService<IAppointmentStaffMember, IdParams>
  implements IAppointmentStaffMembersService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async assignStaffMembers(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]): Promise<IAppointmentStaffMember[]> {
    const payload = this.parsePayload(appointmentProgramId, staffMembers);
    return this.http.patch<IAppointmentStaffMember[]>(`${this.baseUrl}/assign-staff-members`, payload);
  }

  async fetchAvailabilites(payload: IStaffMemberAvailabilityRequest): Promise<IDateRange[]> {
    return this.http.post<IDateRange[]>(`${this.baseUrl}/staff-member-availabilities`, payload);
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<IAppointmentStaffMember, IEntity>> {
    return this.http.get('appointment/search/appointment-staff-members', { params, isOData: true });
  }

  parsePayload(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]) {
    return {
      appointmentProgramId,
      staffMembers: staffMembers.map((m) => ({
        userAccountId: m.userAccountId,
        serviceOptionIds: m.serviceOptionIds,
      })),
    };
  }
}
