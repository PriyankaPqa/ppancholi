import { IEntity } from '../../base';
import { DayOfWeek, IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';

export interface IStaffMemberAvailabilityRequest {
  dateTime: Date,
  appointmentProgramId: string,
  localDayOfWeek: DayOfWeek,
  staffMemberIds: string[],
}
export interface IAppointmentStaffMember extends IEntity {
  userAccountId: uuid;
  appointmentProgramId: uuid;
  useBusinessHours: boolean;
  serviceOptionIds: uuid[];
  defaultbusinessHours: IDaySchedule[];
  customDateRanges: IDateRange[];
}
