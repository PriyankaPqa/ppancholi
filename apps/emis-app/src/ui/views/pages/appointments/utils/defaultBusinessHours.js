import { DayOfWeek } from '@libs/entities-lib/appointment';

export const defaultBusinessHours = [
  { day: DayOfWeek.Monday, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
  { day: DayOfWeek.Tuesday, timeSlots: [{ start: '09:00:00', end: '10:00:00' }, { start: '11:00:00', end: '17:00:00' }] },
  { day: DayOfWeek.Wednesday, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
  { day: DayOfWeek.Thursday, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
  { day: DayOfWeek.Friday, timeSlots: [{ start: '09:00:00', end: '10:00:00' }, { start: '11:00:00', end: '17:00:00' }] },
];
