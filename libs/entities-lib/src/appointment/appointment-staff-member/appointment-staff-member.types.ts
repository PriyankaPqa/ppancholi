import { IEntity } from '../../base';
import { IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';

export interface IStaffMemberAvailabilityRequest {
  appointmentProgramId: string,
  userAccountIds: string[],
  selectedDate: string,
  selectedDateStartInUtc: string,
}
export interface IAppointmentStaffMember extends IEntity {
  userAccountId: uuid;
  appointmentProgramId: uuid;
  useBusinessHours: boolean;
  serviceOptionIds: uuid[];
  defaultbusinessHours: IDaySchedule[];
  customDateRanges: IDateRange[];
}
