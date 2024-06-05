<!-- POC Component for displaying the staff member availability in a week view calendar -->

<template>
  <div class="pa-4">
    <v-toolbar
      flat>
      <v-btn
        fab
        text
        small
        color="grey darken-2"
        @click="prev">
        <v-icon small>
          mdi-chevron-left
        </v-icon>
      </v-btn>
      <v-btn
        fab
        text
        small
        color="grey darken-2"
        @click="next">
        <v-icon small>
          mdi-chevron-right
        </v-icon>
      </v-btn>

      <v-btn
        small
        color="primary"
        class="mx-5"
        @click="showCustomSchedule = true">
        CUSTOM SCHEDULE
      </v-btn>
      APPOINTMENT PROGRAM TIME ZONE:
      <v-select
        v-model="timeZone"
        class="mx-5"
        placeholder="Change event timezone here"
        :items="['Europe/London', 'Etc/GMT+2', 'America/Halifax', 'America/New_York', 'America/Phoenix', 'America/Los_Angeles']" />
      <v-spacer />
      <v-menu
        bottom
        right>
        <template #activator="{ on, attrs }">
          <v-btn
            outlined
            color="grey darken-2"
            v-bind="attrs"
            v-on="on">
            <span>{{ typeToLabel[type] }}</span>
            <v-icon right>
              mdi-menu-down
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="type = 'day'">
            <v-list-item-title>Day</v-list-item-title>
          </v-list-item>
          <v-list-item @click="type = 'week'">
            <v-list-item-title>Week</v-list-item-title>
          </v-list-item>
          <v-list-item @click="type = 'month'">
            <v-list-item-title>Month</v-list-item-title>
          </v-list-item>
          <v-list-item @click="type = '4day'">
            <v-list-item-title>4 days</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-calendar
      ref="calendar"
      v-model="value"
      :weekdays="weekday"
      :type="type"
      :events="events"
      :event-overlap-mode="'stack'"
      :event-overlap-threshold="30"
      :event-color="getEventColor"
      :interval-style="getIntervalStyle"
      :interval-minutes="30"
      :interval-height="20"
      :first-time="'00:00'"
      :interval-count="66"
      @change="getEvents"
      @click:event="showEvent"
      @click:time="showTime"
      @click:day="showDay"
      @click:date="viewDay"
      @click:interval="showInterval" />
    <rc-dialog
      v-if="showDialog"
      :show.sync="showDialog"
      title="POC Event"
      :persistent="true"
      :max-width="750"
      :min-height="480"
      @cancel="showDialog = false; eventClicked = false;"
      @close="showDialog = false; eventClicked = false; ">
      <div v-if="selectedEvent.name">
        <div>
          {{ selectedEvent.name }}
        </div>
        <div>
          {{ `Start: ${helpers.getLocalStringDate(selectedEvent.start, 'local', 'PP p')} - End: ${helpers.getLocalStringDate(selectedEvent.end, 'local', 'PP p')}` }}
        </div>
      </div>
      <div v-else>
        Date: {{ selectedEvent }}
      </div>
    </rc-dialog>
    <custom-schedule
      v-if="showCustomSchedule"
      :show.sync="showCustomSchedule"
      :default-schedule="DEFAULT_SCHEDULE"
      :custom-schedule="customSchedule"
      :merged-local-time-schedule="mergedLocalTimeSchedule"
      :program-time-zone="timeZone"
      :date="rangeStartDate"
      @reloadSchedule="reloadSchedule" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parseISO, addDays, format } from 'date-fns';
import { mockAppointment, IAppointment, IDaySchedule, DayOfWeek, IDateRange, ITimeSlot } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { RcDialog } from '@libs/component-lib/components';
import _cloneDeep from 'lodash/cloneDeep';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import CustomSchedule from './CustomSchedule.vue';

const APPOINTMENTS = [
  mockAppointment({ startDate: '2024-05-15T15:00:00.000Z',
  endDate: '2024-05-15T16:00:00.000Z',
  attendeeId: 'Jane Blue',
}),
  mockAppointment({ serviceOptionId: 'service-id-2' }),
];

const DEFAULT_SCHEDULE: IDaySchedule[] = [
  { day: DayOfWeek.Saturday, timeSlots: [{ start: '03:00', end: '07:00' }, { start: '20:00', end: '23:00' }] },
  // { day: DayOfWeek.Saturday, timeSlots: [{ start: '20:00', end: '22:00' }] },
  { day: DayOfWeek.Tuesday, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  { day: DayOfWeek.Wednesday, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  { day: DayOfWeek.Thursday, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  { day: DayOfWeek.Friday, timeSlots: [{ start: '09:00', end: '16:00' }] },
];

const CUSTOM_SCHEDULE: IDateRange[] = [
  // { start: new Date('2024-05-27 11:00 UTC').toISOString(), end: new Date('2024-05-20 16:00 UTC').toISOString() },
  // { start: new Date('2024-05-27 18:00 UTC').toISOString(), end: new Date('2024-05-27 22:00 UTC').toISOString() },
  // { start: new Date('2024-05-21 18:00 UTC').toISOString(), end: new Date('2024-05-21 23:00 UTC').toISOString() },
  // { end: '2024-05-11T04:00:00.000Z', start: '2024-05-11T02:30:00.000Z' },
  // { end: '2024-06-11T04:00:00.000Z', start: '2024-06-11T02:30:00.000Z' },
//  { end: '2024-05-31T04:00:00.000Z', start: '2024-05-31T02:30:00.000Z' },
];

const APPOINTMENT_PROGRAM_TIMEZONE = 'America/Los_Angeles'; // TODO: make timezones enum

export interface ICalendarEvent {
  name: string,
  start: Date,
  end: Date,
  color: string,
  timed?: boolean,
}

export interface ICalendarData {
  date: string,
  day: number,
  year: number,
  month: number,
  weekday: number,
  hour: number,
  minute: number,
}

export default Vue.extend({
  name: 'StaffAvailability',
  components: {
    RcDialog,
    CustomSchedule,
  },
  data: () => ({
    focus: '',
    type: 'week',
    types: ['month', 'week', 'day', '4day'],
    mode: 'column',
    modes: ['stack', 'column'],
    weekday: [0, 1, 2, 3, 4, 5, 6],
    value: '',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    events: [] as ICalendarEvent[],
    colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
    appointments: APPOINTMENTS,
    selectedEvent: {} as ICalendarEvent,
    showDialog: false,
    eventClicked: false,
    helpers,
    timeZone: APPOINTMENT_PROGRAM_TIMEZONE,
    localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    showCustomSchedule: false,
    DEFAULT_SCHEDULE,
    mergedLocalTimeSchedule: {} as Record<number, IDaySchedule>,
    rangeStartDate: '',
    rangeEndDate: '',
    clonedDefaultSchedule: {} as Record<number, IDaySchedule>,
  }),

  computed: {
    customSchedule() {
      return useAppointmentProgramStore().customSchedule || CUSTOM_SCHEDULE;
    },

  },

  watch: {
    timeZone(newZone) {
      if (newZone) {
        this.reloadSchedule();
      }
    },

    rangeStartDate() {
      this.reloadSchedule();
    },
  },

    methods: {
      prev() {
        (this.$refs.calendar as any).prev();
      },
      next() {
        (this.$refs.calendar as any).next();
      },
      setToday() {
        this.focus = '';
      },
      viewDay({ date }: { date: string }) {
        this.focus = date;
        this.type = 'day';
      },

      getEvents(updateData: { start: ICalendarData, end: ICalendarData }) {
        const events = this.parseEventsFromAppointments(this.appointments);
        this.events = events;
        this.rangeStartDate = updateData.start.date;
        this.rangeEndDate = updateData.end.date;
      },
      getEventColor(event: ICalendarEvent) {
        return event.color;
      },

      parseEventsFromAppointments(appointments: IAppointment[]): ICalendarEvent[] {
        return appointments.map((a) => ({
          name: a.attendeeId,
          start: parseISO(a.startDate as string),
          end: parseISO(a.endDate as string),
          color: a.serviceOptionId === 'service-id-1' ? 'red' : 'grey',
          timed: true,
        }));
      },

      showDay(data: any) {
        setTimeout(() => {
          const showDayDialog = !this.eventClicked;
          if (showDayDialog) {
              this.showDialog = showDayDialog;
              this.selectedEvent = data.date;
            }
        }, 0);
      },

      showEvent(data: any) {
        this.eventClicked = true;
        this.showDialog = true;
        this.selectedEvent = data.event;
      },

      showTime(data: any) {
        // eslint-disable-next-line no-console
        console.log(data);
      },
      showInterval(data: any) {
        // eslint-disable-next-line no-console
        console.log(data);
      },

      getIntervalStyle(interval: ICalendarData) {
        const day = this.mergedLocalTimeSchedule[interval.weekday];

        let backgroundColor = 'lightgray';
        // Code to display the interval background color depending on start and end dateTime of the timeslot
        if (day?.timeSlots?.length) {
          day.timeSlots.forEach((slot) => {
            const startHour = utcToZonedTime(slot.startDateTime, this.localTimeZone).getHours();
            const startMinute = utcToZonedTime(slot.startDateTime, this.localTimeZone).getMinutes();
            let endHour = utcToZonedTime(slot.endDateTime, this.localTimeZone).getHours();
            const endMinute = utcToZonedTime(slot.endDateTime, this.localTimeZone).getMinutes();

            if (endHour < startHour) {
              endHour += 24;
            }

            if ((interval.hour > startHour || (interval.hour === startHour && interval.minute >= startMinute))
            && (interval.hour < endHour || (interval.hour === endHour && interval.minute < endMinute))
          ) {
               backgroundColor = 'darkblue';
            }
          });
        }

        return { backgroundColor };
      },

      // TODO : move some of these methods into helpers files

    // deep clone the merged local schedule and turn it into an object with the week days as keys,
    // {0: IDaySchedule for Sunday, 1: IDaySchedule for Monday, etc}
      calculateDefaultScheduleDates() {
        const programTimeZone = this.timeZone; // TODO get from appointment program timezone
        // sets the start and end of the default schedule for each day to UTC time, with the dates of the current week
        (helpers.getEnumValues(DayOfWeek) as number[]).forEach((weekDay) => {
          const date = format(addDays(utcToZonedTime(new Date(this.rangeStartDate), 'UTC'), weekDay), 'yyyy-MM-dd');

          const schedule = DEFAULT_SCHEDULE.find((day) => day.day === weekDay) || {} as IDaySchedule;
          schedule.date = date;
          schedule.day = schedule.day || weekDay;

          schedule.timeSlots = schedule.timeSlots ? _cloneDeep(schedule.timeSlots).map((slot) => {
            slot.startDateTime = zonedTimeToUtc(`${date} ${slot.start}`, programTimeZone).toISOString();
            slot.endDateTime = zonedTimeToUtc(`${date} ${slot.end}`, programTimeZone).toISOString();
            return slot;
          }) : [];

          this.clonedDefaultSchedule[weekDay] = schedule;
        });
      },

      calculateMergedSchedule() {
        const slotsToRecalculate = [] as { slot: ITimeSlot, localMidnight: Date, localNextMidnight: Date }[];
        Object.keys(this.clonedDefaultSchedule).forEach((scheduleKey) => {
          const localSchedule = _cloneDeep(this.clonedDefaultSchedule[+scheduleKey]);

          const localMidnight = new Date(`${localSchedule.date} 0:00`);
          const localNextMidnight = new Date(localMidnight.getTime());
          localNextMidnight.setDate(localNextMidnight.getDate() + 1);

          // extract the custom schedule dates that correspond to a day of a week (from the local localMidnight to the next local localMidnight)
          // A custom schedule will override the default schedule (time slots) for the whole respective day (localMidnight to localMidnight)
          const customDateRanges = this.customSchedule.filter((slot) => new Date(slot.start) >= localMidnight && new Date(slot.start) < localNextMidnight);

          if (customDateRanges?.length) {
            localSchedule.timeSlots = [];
            customDateRanges.forEach((slot) => {
              localSchedule.timeSlots.push({
                ...slot,
                startDateTime: slot.start,
                endDateTime: slot.end,
              });
            });
            localSchedule.custom = true;
          }

          // the mergedLocalTimeSchedule shoud contain in the timeslots of the default and custom schedule
          // the start and end time (time only, no date, e.g. "17:00") in local time
          localSchedule.timeSlots = localSchedule.timeSlots.map((slot) => {
            slot.start = format(new Date(slot.startDateTime), 'HH:mm');
            slot.end = format(new Date(slot.endDateTime), 'HH:mm');

            // The timeslot might overflow to the next or previous day because it was set to local time from appointment program timezone,
            // so we need to recalculate it and move it to the right week day in the local time zone, potentially also split it if only
            // part of it overflows
            const isTimeSlotSameDay = new Date(slot.startDateTime) >= localMidnight && new Date(slot.endDateTime) < localNextMidnight;
            if (!isTimeSlotSameDay) {
              slotsToRecalculate.push({ slot, localMidnight, localNextMidnight });
              // We remove the overflowing slot from the list, as we will need recalculate and move it to another day fully or partially (see recalculateDiffentDaySlot)
              return null;
            }
            return slot;
          }).filter((x) => x);

          this.mergedLocalTimeSchedule[localSchedule.day] = localSchedule;
        });

        // we need to run the recalculation after we are out of the loop, because it will add new timeslots to the current lists
        slotsToRecalculate.forEach((data) => this.recalculateDiffentDaySlot(data));
      },

      // Recalculate time slots that overflow past midnight a different day (either to previous or next day)
      recalculateDiffentDaySlot({ slot, localMidnight, localNextMidnight } :{ slot: ITimeSlot, localMidnight: Date, localNextMidnight: Date }) {
        const isStartInPreviousDay = new Date(slot.startDateTime) < localMidnight;
        const isEndInPreviousDay = new Date(slot.endDateTime) < localMidnight;
        const isStartInNextDay = new Date(slot.startDateTime) > localNextMidnight;
        const isEndInNextDay = new Date(slot.endDateTime) > localNextMidnight;
        const currentDaySchedule = this.mergedLocalTimeSchedule[localMidnight.getDay()];

        // OtherDay is the new day in which the timeslot overflows, can be before or after the current day (= the day for which we calculate the overflow)
        // the part of the slot that overflows (or the whole slot, if it overflows entirely), will be added to this day.
        let otherDay = addDays(utcToZonedTime(localMidnight, 'UTC'), isStartInPreviousDay ? -1 : 1);
        // We're considering a week from Sunday to Saturday. if the overflow happens outside of the reference week
        // (e.g. from Saturday to Sunday - which falls into the next week)
        // we need to move the slot to the beginning of the week (e.g. Sunday of the current week)
        const isOtherDayInCurrentWeek = format(otherDay, 'yyyy-MM-dd') >= this.rangeStartDate && format(otherDay, 'yyyy-MM-dd') <= this.rangeEndDate;
        if (!isOtherDayInCurrentWeek) {
          otherDay = isStartInPreviousDay ? addDays(utcToZonedTime(new Date(this.rangeStartDate), 'UTC'), 6)
          : addDays(utcToZonedTime(new Date(this.rangeEndDate), 'UTC'), -6);
        }

        const otherDayString = format(otherDay, 'yyyy-MM-dd');
        const otherDaySchedule = this.mergedLocalTimeSchedule[otherDay.getDay()];

        //  the slot is entirely in a different day than the reference day (local day localMidnight to localMidnight)
        if ((isStartInPreviousDay && isEndInPreviousDay) || (isStartInNextDay && isEndInNextDay)) {
          const newSlot = {
            ...slot,
            startDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} ${slot.start}`).toISOString(),
            endDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} ${slot.end}`).toISOString(),
            date: otherDayString,
          };

          otherDaySchedule.timeSlots.push(newSlot);

          // the slot starts in previous day and ends in current day (local day localMidnight to localMidnight)
        } else if (isStartInPreviousDay && !isEndInPreviousDay) {
          // we create a new slot that ends at midnight of previous day and push it to the list of timeslots of that day
          const newSlot = {
              ...slot,
              startDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} ${slot.start}`).toISOString(),
              endDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} 0:00`).toISOString(),
              end: '00:00',
              date: otherDayString,
            };

            otherDaySchedule.timeSlots.push(newSlot);
            // we cut the current slot to start only from midnight
          currentDaySchedule.timeSlots.push({
            ...slot,
            startDateTime: localMidnight.toISOString(),
            start: '00:00',
          });

          // the slot starts in current day and ends in next day (local day localMidnight to localMidnight)
        } else {
          const newSlot = {
              ...slot,
              startDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} 0:00`).toISOString(),
              start: '00:00',
              endDateTime: new Date(`${format(otherDay, 'yyyy-MM-dd')} ${slot.end}`).toISOString(),
              date: otherDayString,
            };

          otherDaySchedule.timeSlots.push(newSlot);
          currentDaySchedule.timeSlots.push({
            ...slot,
            endDateTime: localNextMidnight.toISOString(),
            end: '00:00',
          });
        }
      },

      // TODO: for the POC the schedule needs to be reloaded when the dialog closes, but later we will simply reload the data,
      // since the dialogs for default and custom schedule will make Apply/Submit calls to the BE to update the schedule
      reloadSchedule() {
        this.mergedLocalTimeSchedule = [];
        // this.clonedDefaultSchedule = DEFAULT_SCHEDULE;
        this.calculateDefaultScheduleDates();
        this.calculateMergedSchedule();
      },
    },

});
</script>

<style scoped lang="scss">
  ::v-deep .v-calendar-weekly__week {
    min-height: 70px;
  }
</style>
