import _cloneDeep from 'lodash/cloneDeep';
import { IDaySchedule, ITimeSlot } from '@libs/entities-lib/appointment';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { addDays, format } from 'date-fns';

export default {

  // calculate the UTC time when a weekstarts and ends
  weekRange(rangeStart: string): { start: Date, end:Date } {
    const utcRangeStart = new Date(`${rangeStart} 0:00`);
    const utcRangeEnd = new Date(utcRangeStart.getTime());
    utcRangeEnd.setDate(utcRangeEnd.getDate() + 7);

    return { start: utcRangeStart, end: utcRangeEnd };
  },

  // Recalculate time slots that overflow past midnight a different day (either to previous or next day)
  // eslint-disable-next-line complexity
  recalculateDifferentDaySlot(
    { slot, midnight, nextMidnight, currentDay, rangeStartDate, fullSchedule }
    :{ slot: ITimeSlot, midnight: Date, nextMidnight: Date, currentDay: number, rangeStartDate: string, fullSchedule: Record<number, IDaySchedule> },
    ) {
      if (!slot || !rangeStartDate || currentDay == null || !midnight || !nextMidnight) {
        return;
      }
      const isStartInPreviousDay = new Date(slot.startDateTime) < midnight;
      const isEndInPreviousDay = new Date(slot.endDateTime) < midnight;
      const isStartInNextDay = new Date(slot.startDateTime) > nextMidnight;
      const isEndInNextDay = new Date(slot.endDateTime) > nextMidnight;
      const currentDaySchedule = fullSchedule[currentDay];
      const { start: rangeStart, end: rangeEnd } = this.weekRange(rangeStartDate);

      // OtherDay is the new day in which the timeslot overflows, can be before or after the current day (= the day for which we calculate the overflow)
      // the part of the slot that overflows (or the whole slot, if it overflows entirely), will be added to this day.
      let otherDay = addDays(midnight, isStartInPreviousDay ? -1 : 1);

      // We're considering a week from Sunday to Saturday. if the overflow happens outside of the reference week
      // (e.g. from Saturday to Sunday - which falls into the next week), we need to move the slot to the beginning of the week (e.g. Sunday of the current week)
      const isOtherDayInCurrentWeek = otherDay >= rangeStart && otherDay < rangeEnd;
      if (!isOtherDayInCurrentWeek) {
        otherDay = isStartInPreviousDay ? addDays(otherDay, 7) : addDays(otherDay, -7);
      }

      const otherDayString = format(utcToZonedTime(otherDay, 'UTC'), 'yyyy-MM-dd');
      // for getting the schedule for the otherDay, we need to consider that the current day might be at the end or start of a week
      // so the otherDay will be in this case the day at the start of the week or the end respectively
      // e.g If the current day is 0, the previous day is 6. if the current day is 6, the next day is 0.
      const otherDaySchedule = fullSchedule[isStartInPreviousDay ? (7 + currentDay - 1) % 7 : (7 + currentDay + 1) % 7];

      let otherDaySlot = null;
      let currentDaySlot = null;

      //  the slot is entirely in a different day than the reference day (local day localMidnight to localMidnight)
      if ((isStartInPreviousDay && isEndInPreviousDay) || (isStartInNextDay && isEndInNextDay)) {
        otherDaySlot = {
          ...slot,
          startDateTime: new Date(`${otherDayString} ${slot.start}`).toISOString(),
          endDateTime: new Date(`${otherDayString} ${slot.end}`).toISOString(),
        };

        // the slot starts in previous day and ends in current day (local day localMidnight to localMidnight)
      } else if (isStartInPreviousDay && !isEndInPreviousDay) {
        // we create a new slot that ends at midnight of previous day and push it to the list of timeslots of that day
        otherDaySlot = {
          ...slot,
          startDateTime: new Date(`${otherDayString} ${slot.start}`).toISOString(),
          endDateTime: addDays(otherDay, 1).toISOString(), // next midnight of otherDay
          end: '00:00',
        };

          // we cut the current slot to start only from midnight
        currentDaySlot = { ...slot, startDateTime: midnight.toISOString(), start: '00:00' };

        // the slot starts in current day and ends in next day (local day localMidnight to localMidnight)
      } else {
        otherDaySlot = {
          ...slot,
          startDateTime: otherDay.toISOString(),
          start: '00:00',
          endDateTime: new Date(`${otherDayString} ${slot.end}`).toISOString(),
        };

        currentDaySlot = { ...slot, endDateTime: nextMidnight.toISOString(), end: '00:00' };
      }

      // Adding the newly calculated slots to their respective schedules timeslots lists
      otherDaySchedule.timeSlots = this.mergeTimeSlots(otherDaySlot, otherDaySchedule.timeSlots);
      if (currentDaySlot) {
        currentDaySchedule.timeSlots = this.mergeTimeSlots(currentDaySlot, currentDaySchedule.timeSlots);
      }
    },

    // when we add a new timeslot to a list, if there already is a timeslot that has overlapping start/end times, we merge the 2 slots
    // e.g a slot starts at 1pm and ends at 3pm, another starts 3pm, ends 4pm  => we create one slot that start 1pm and ends 4pm
    // There should be no overlapping of slots more than strictly start/end time being the same, as there are rules when creating them that don't allow slot overlaps
    mergeTimeSlots(slot:ITimeSlot, timeSlots: ITimeSlot[]): ITimeSlot[] {
      const tangentSlotIndex = timeSlots.findIndex((s) => s.start === slot.end || s.end === slot.start);
      const newSlot = { ...slot };

      if (tangentSlotIndex >= 0) {
        const tangentSlot = timeSlots[tangentSlotIndex];
        timeSlots.splice(tangentSlotIndex, 1);
        if (slot.start === tangentSlot.end) {
          newSlot.start = tangentSlot.start;
          newSlot.startDateTime = tangentSlot.startDateTime;
        } else if (slot.end === tangentSlot.start) {
          newSlot.end = tangentSlot.end;
          newSlot.endDateTime = tangentSlot.endDateTime;
        }
      }

      timeSlots.push(newSlot);
      return timeSlots;
    },

    // Change the hours of the default schedule to another timezone - either the user's local timezone or the timezone of the appointment program
    // Contains also the recalculation of hours if by changing the timezone they overflow to a different day
    setDefaultScheduleToTimeZoneHours(defaultSchedule: Record<number, IDaySchedule>, timeZone = 'local'): Record<number, IDaySchedule> {
      const slotsToRecalculate = [] as { slot: ITimeSlot, midnight: Date, nextMidnight: Date, currentDay: number }[];

      Object.keys(defaultSchedule).forEach((day) => {
        const schedule = defaultSchedule[+day];

        const localMidnight = timeZone === 'local' ? new Date(`${schedule.date} 0:00`) : zonedTimeToUtc(`${schedule.date} 0:00`, timeZone); // TODO: make helper for midnight calculations?
        const localNextMidnight = new Date(localMidnight.getTime());
        localNextMidnight.setDate(localNextMidnight.getDate() + 1);

        schedule.timeSlots = _cloneDeep(schedule.timeSlots).map((slot) => {
          slot.start = timeZone === 'local' ? format(new Date(slot.startDateTime), 'HH:mm') : format(utcToZonedTime(slot.startDateTime, timeZone), 'HH:mm');
          slot.end = timeZone === 'local' ? format(new Date(slot.endDateTime), 'HH:mm') : format(utcToZonedTime(slot.endDateTime, timeZone), 'HH:mm');

          // The timeslot might overflow to the next or previous day because it was set to local time from appointment program timezone,
          // so we need to recalculate it and move it to the right week day in the local time zone, potentially also split it if only
          // part of it overflows
          const isTimeSlotSameDay = new Date(slot.startDateTime) >= localMidnight && new Date(slot.endDateTime) <= localNextMidnight;

          if (!isTimeSlotSameDay) {
            slotsToRecalculate.push({ slot, midnight: localMidnight, nextMidnight: localNextMidnight, currentDay: schedule.day });
            // We remove the overflowing slot from the list, as we will need recalculate and move it to another day fully or partially (see recalculateDifferentDaySlot)
            return null;
          }
          return slot;
        }).filter((x) => x);
      });

      // we need to run the recalculation after we are out of the loop, because it will add new timeslots to the current lists
      slotsToRecalculate.forEach((data) => this.recalculateDifferentDaySlot({ ...data, rangeStartDate: defaultSchedule[0]?.date, fullSchedule: defaultSchedule }));
      return defaultSchedule;
    },

    // create a list of intervals for the dropdowns, containing the hours of
    createDropdownTimeIntervals(fromArg: string, untilArg: string, intervalLength: number = 30): { text:string, value:string }[] {
      const until = Date.parse(`01/01/2001 ${untilArg}`);
      const from = Date.parse(`01/01/2001 ${fromArg}`);
      const max = ((until - from) / (60 * 60 * 1000)) * (60 / intervalLength);
      let time = new Date(from);
      const intervals = [];

      for (let i = 0; i <= max; i += 1) {
        intervals.push(new Date(time));
        time = new Date(time.setMinutes(time.getMinutes() + intervalLength));
      }

      return intervals.map((i) => ({ text: format(i, 'hh:mm a'), value: format(i, 'HH:mm') }));
    },

};
