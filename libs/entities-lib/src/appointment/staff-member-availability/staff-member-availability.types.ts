import { IEntity } from '../../base';
import { IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';

export interface IStaffMemberAvailability extends IEntity {
  staffMemberId: uuid;
  appointmentProgramId: uuid;
  useBusinessHours: boolean;
  serviceOptionIds: uuid[];
  defaultbusinessHours: IDaySchedule[];
  customDateRanges: IDateRange[];
}
