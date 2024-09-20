import { mockBaseData } from '../../base';
import { mockBusinessHours } from '../appointment-program/appointment-program.mock';
import { IAppointmentStaffMember } from './appointment-staff-member.types';

export const mockAppointmentStaffMember = (force? : Partial<IAppointmentStaffMember>): IAppointmentStaffMember => ({
  ...mockBaseData(),
  userAccountId: 'mock-staffMemberId',
  appointmentProgramId: 'mock-appointmentProgramId',
  useBusinessHours: false,
  serviceOptionIds: ['mock-serviceOptionId'],
  defaultbusinessHours: mockBusinessHours(),
  customDateRanges: [{ startDateTime: '2024-01-29T16:00:00.000Z', endDateTime: '2024-01-29T19:00:00.000Z' }],
  ...force,
});
