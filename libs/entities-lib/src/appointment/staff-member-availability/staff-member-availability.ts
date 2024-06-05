import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '../../base';
import { IDaySchedule } from '../appointment-program/appointment-program.types';
import { IDateRange, IStaffMemberAvailability } from './staff-member-availability.types';

export class StaffMemberAvailability extends BaseEntity {
  staffMemberId: uuid;

  appointmentProgramId: uuid;

  useBusinessHours: boolean;

  defaultBookingHours: IDaySchedule[];

  customDateRanges: IDateRange[];

constructor(data?: IStaffMemberAvailability) {
  if (data) {
    super(data);
    this.staffMemberId = data?.staffMemberId;
    this.appointmentProgramId = data?.appointmentProgramId;
    this.useBusinessHours = data?.useBusinessHours;
    this.defaultBookingHours = data?.defaultBookingHours ? _cloneDeep(data.defaultBookingHours) : [];
    this.customDateRanges = data?.customDateRanges ? _cloneDeep(data.customDateRanges) : [];
  } else {
    super();
    this.staffMemberId = null;
    this.appointmentProgramId = null;
    this.useBusinessHours = null;
    this.defaultBookingHours = [];
    this.customDateRanges = [];
  }
}
}
