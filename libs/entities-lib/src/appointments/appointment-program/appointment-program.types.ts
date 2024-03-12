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
  EMISId: uuid;
  emailAddress: string;
  displayName: string;
  workingHours: IBookingWorkHours;
}

export interface IService {
  customQuestions: [];
  defaultDuration: string;
  description: string;
  displayName: string;
  isLocationOnline: Boolean;
  postBuffer: string;
  preBuffer: string;
  staffMemberIds: string[];
}

export interface IAppointmentProgram {
  name: string;
  eventId: uuid;
  staffMembers: IStaffMember[];
  services: IService[];
}
