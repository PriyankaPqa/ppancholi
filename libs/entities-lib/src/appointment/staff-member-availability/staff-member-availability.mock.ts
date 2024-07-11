import { mockBaseData } from '../../base';
import { mockbusinessHours } from '../appointment-program/appointment-program.mock';
import { IStaffMemberAvailability } from './staff-member-availability.types';

export const mockStaffMemberAvailability = (force? : Partial<IStaffMemberAvailability>): IStaffMemberAvailability => ({
  ...mockBaseData(),
  staffMemberId: 'mock-staffMemberId',
  appointmentProgramId: 'mock-appointmentProgramId',
  useBusinessHours: false,
  serviceOptionIds: ['mock-serviceOptionId'],
  defaultbusinessHours: mockbusinessHours(),
  customDateRanges: [{ startDateTime: '2024-01-29T16:00:00.000Z', endDateTime: '2024-01-29T19:00:00.000Z' }],
  ...force,
});
