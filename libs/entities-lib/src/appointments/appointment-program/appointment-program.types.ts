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
  displayName: string; // ???
  workingHours: IBookingWorkHours;
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

export interface IAppointmentProgram { // aka Booking business
  name: string;
  eventId: uuid;
  staffMembers: IStaffMember[];
  services: IService[];
}
