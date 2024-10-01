import { IEntity } from '../../base';
import { DayOfWeek, IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';

export interface IStaffMemberAvailabilityRequest {
  dateTime: string,
  appointmentProgramId: string,
  localDayOfWeek: DayOfWeek,
  userAccountIds: string[],
}
export interface IAppointmentStaffMember extends IEntity {
  userAccountId: uuid;
  appointmentProgramId: uuid;
  useBusinessHours: boolean;
  serviceOptionIds: uuid[];
  defaultbusinessHours: IDaySchedule[];
  customDateRanges: IDateRange[];
}
