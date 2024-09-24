import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '../../base';
import { IDateRange, IDaySchedule } from '../appointment-program/appointment-program.types';
import { IAppointmentStaffMember } from './appointment-staff-member.types';

export class AppointmentStaffMember extends BaseEntity {
  userAccountId: uuid;

  appointmentProgramId: uuid;

  useBusinessHours: boolean;

  serviceOptionIds: uuid[];

  defaultbusinessHours: IDaySchedule[];

  customDateRanges: IDateRange[];

constructor(data?: IAppointmentStaffMember) {
  if (data) {
    super(data);
    this.userAccountId = data?.userAccountId;
    this.appointmentProgramId = data?.appointmentProgramId;
    this.useBusinessHours = data?.useBusinessHours;
    this.serviceOptionIds = data?.serviceOptionIds;
    this.defaultbusinessHours = data?.defaultbusinessHours ? _cloneDeep(data.defaultbusinessHours) : [];
    this.customDateRanges = data?.customDateRanges ? _cloneDeep(data.customDateRanges) : [];
  } else {
    super();
    this.userAccountId = null;
    this.appointmentProgramId = null;
    this.useBusinessHours = null;
    this.serviceOptionIds = [];
    this.defaultbusinessHours = [];
    this.customDateRanges = [];
  }
}
}
