import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '../../base';
import { IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';
import { IStaffMemberAvailability } from './staff-member-availability.types';

export class StaffMemberAvailability extends BaseEntity {
  staffMemberId: uuid;

  appointmentProgramId: uuid;

  useBusinessHours: boolean;

  serviceOptionIds: uuid[];

  defaultbusinessHours: IDaySchedule[];

  customDateRanges: IDateRange[];

constructor(data?: IStaffMemberAvailability) {
  if (data) {
    super(data);
    this.staffMemberId = data?.staffMemberId;
    this.appointmentProgramId = data?.appointmentProgramId;
    this.useBusinessHours = data?.useBusinessHours;
    this.serviceOptionIds = data?.serviceOptionIds;
    this.defaultbusinessHours = data?.defaultbusinessHours ? _cloneDeep(data.defaultbusinessHours) : [];
    this.customDateRanges = data?.customDateRanges ? _cloneDeep(data.customDateRanges) : [];
  } else {
    super();
    this.staffMemberId = null;
    this.appointmentProgramId = null;
    this.useBusinessHours = null;
    this.serviceOptionIds = [];
    this.defaultbusinessHours = [];
    this.customDateRanges = [];
  }
}
}
