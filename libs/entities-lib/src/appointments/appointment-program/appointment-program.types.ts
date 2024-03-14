import { IEntity } from '@/base';
import { IMultilingual } from '@libs/shared-lib/src/types';

export enum DayOfWeek {
  Sunday = 'sunday',
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
}

export interface IBookingTime {
  hour: number;
  minute: number;
  second: number;
}

 export interface IBookingWorkTimeSlot {
  startTime: IBookingTime;
  endTime: IBookingTime;
 }

export interface IBookingWorkHours {
  day: DayOfWeek;
  timeSlots: IBookingWorkTimeSlot[];
}

export interface IStaffMember {
  MSBookingId: uuid;
  EMISId: uuid; // User account Id
  emailAddress: string;
  workingHours: IBookingWorkHours[];
  displayName: string;
  roleName: IMultilingual;
}

export interface IService {
  customQuestions: [];
  defaultDuration: string;
  description: string;
  displayName: string;
  schedule:IBookingWorkHours;
  isLocationOnline: Boolean;
  postBuffer: string;
  preBuffer: string;
  staffMemberIds: string[];
  appointmentProgrammId: uuid;
}

export interface IAppointmentProgramEntity extends IEntity { // aka Booking business
  name: IMultilingual;
  eventId: uuid;
  staffMembers: IStaffMember[];
  services: IService[];
  businessHours: IBookingWorkHours[];
}
