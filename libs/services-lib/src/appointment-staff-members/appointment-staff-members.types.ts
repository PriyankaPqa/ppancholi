import { IAppointmentStaffMember, IStaffMemberAvailabilityRequest } from '@libs/entities-lib/appointment/appointment-staff-member/appointment-staff-member.types';
import { IDateRange, IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentStaffMembersService extends IDomainBaseService<IAppointmentStaffMember, IdParams> {
  assignStaffMembers(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]): Promise<IAppointmentStaffMember[]>;
  fetchAvailabilites(payload: IStaffMemberAvailabilityRequest): Promise<IDateRange[]>
}

export interface IAppointmentStaffMembersServiceMock extends IDomainBaseServiceMock<IAppointmentStaffMember> {
  assignStaffMembers: jest.Mock<IAppointmentStaffMember[]>;
  fetchAvailabilites: jest.Mock<IDateRange[]>;
}
