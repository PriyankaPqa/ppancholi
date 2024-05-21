import { IEntity } from '../../base';
import { IBookingHour } from '../appointment-program/appointment-program.types';

export interface IDateRange {
  start: string | Date;
  end: string | Date;
}

export interface IStaffMemberAvailability extends IEntity {
  staffMemberId: uuid;
  appointmentProgramId: uuid;
  useBusinessHours: boolean;
  defaultBookingHours: IBookingHour[];
  customDateRanges: IDateRange[];
}
