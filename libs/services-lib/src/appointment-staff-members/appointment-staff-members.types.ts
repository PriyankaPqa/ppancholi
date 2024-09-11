import { IAppointmentStaffMember } from '@libs/entities-lib/appointment/appointment-staff-member/appointment-staff-member.types';
import { IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentStaffMembersService extends IDomainBaseService<IAppointmentStaffMember, IdParams> {
  assignStaffMembers(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]): Promise<IAppointmentStaffMember[]>
}

export interface IAppointmentStaffMembersServiceMock extends IDomainBaseServiceMock<IAppointmentStaffMember> {
  assignStaffMembers: jest.Mock<IAppointmentStaffMember[]>;

}
