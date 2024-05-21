import { mockBaseData } from '../../base';
import { mockBookingHours } from '../appointment-program/appointment-program.mock';
import { IStaffMemberAvailability } from './staff-member-availability.types';

export const mockStaffMemberAvailability = (force? : Partial<IStaffMemberAvailability>): IStaffMemberAvailability => ({
  ...mockBaseData(),
  staffMemberId: 'mock-staffMemberId',
  appointmentProgramId: 'mock-appointmentProgramId',
  useBusinessHours: false,
  defaultBookingHours: mockBookingHours(),
  customDateRanges: [{ start: '2024-01-29T16:00:00.000Z', end: '2024-01-29T19:00:00.000Z' }],
  ...force,
});
