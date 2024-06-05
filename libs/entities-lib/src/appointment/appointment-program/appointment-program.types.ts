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
  start: string | Date; // TimeOnly
  end: string | Date; // TimeOnly
  startDateTime?: Date | string;
  endDateTime?: Date | string;
  startLocalTime?: string;
  endLocalTime?: string;
}

export interface IDaySchedule {
  day: DayOfWeek;
  timeSlots: ITimeSlot[];
  date?: string;
  custom?: boolean;
}

export interface IAppointmentProgram extends IEntity {
  eventId: uuid;
  name: IMultilingual;
  timeZone: string;
  bookingHours: IDaySchedule[];
}

export type IAppointmentProgramCombined = IEntityCombined<IAppointmentProgram, IEntity>;

export type IdParams = uuid;
