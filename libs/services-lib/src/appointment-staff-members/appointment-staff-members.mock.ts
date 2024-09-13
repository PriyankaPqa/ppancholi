import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';

import { mockDomainBaseService } from '../base';
import { IAppointmentStaffMembersServiceMock } from './appointment-staff-members.types';

export const mockAppointmentStaffMembersService = (): IAppointmentStaffMembersServiceMock => ({
  ...mockDomainBaseService(mockAppointmentStaffMember()),
  assignStaffMembers: jest.fn(() => [mockAppointmentStaffMember()]),
});
