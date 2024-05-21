import { IMultilingual } from '@libs/shared-lib/src/types';
import { IEntity, IEntityCombined } from '../../base';

/**
 * Enums
 */
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/**
 * Value objects
 */

export interface ITimeSlot {
  start: string; // TimeOnly
  end: string; // TimeOnly
}

export interface IBookingHour {
  day: DayOfWeek;
  timeSlots: ITimeSlot[];
}

export interface IAppointmentProgram extends IEntity {
  eventId: uuid;
  name: IMultilingual;
  timeZone: string;
  bookingHours: IBookingHour[];
}

export type IAppointmentProgramCombined = IEntityCombined<IAppointmentProgram, IEntity>;

export type IdParams = uuid;
