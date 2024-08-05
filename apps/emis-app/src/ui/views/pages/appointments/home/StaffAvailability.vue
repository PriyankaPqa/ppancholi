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
        class="ml-5"
        @click="showDefaultSchedule = true">
        DEFAULT SCHEDULE
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
      :interval-style="getIntervalStyle"
      :interval-minutes="30"
      :interval-height="20"
      :first-time="'00:00'"
      :interval-count="66"
      @change="onChange" />

    <custom-schedule
      v-if="showCustomSchedule"
      :show.sync="showCustomSchedule"
      :default-schedule="localDefaultSchedule"
      :custom-schedule="customSchedule"
      :merged-local-time-schedule="mergedLocalTimeSchedule"
      :program-time-zone="timeZone"
      :range-start-date="weekStartDate"
      @reloadSchedule="reloadSchedule" />
    <default-schedule
      v-if="showDefaultSchedule"
      :show.sync="showDefaultSchedule"
      :default-schedule="localDefaultSchedule"
      :program-time-zone="timeZone"
      :range-start-date="weekStartDate"
      @reloadSchedule="reloadSchedule" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { utcToZonedTime } from 'date-fns-tz';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IDaySchedule } from '@libs/entities-lib/appointment';
import CustomSchedule from './CustomSchedule.vue';
import DefaultSchedule from './DefaultSchedule.vue';
import appointmentHelpers from '../utils/appointmentHelpers';

import { APPOINTMENT_PROGRAM_TIMEZONE, CUSTOM_SCHEDULE, DEFAULT_SCHEDULE } from './mocks';

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
    CustomSchedule,
    DefaultSchedule,
  },
  data: () => ({
    focus: '',
    type: 'week',
    weekday: [0, 1, 2, 3, 4, 5, 6],
    value: '',
    helpers,
    timeZone: APPOINTMENT_PROGRAM_TIMEZONE,
    localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    showCustomSchedule: false,
    showDefaultSchedule: false,
    weekStartDate: '',
    localDefaultSchedule: {} as Record<number, IDaySchedule>, // the default schedule with hours at the user's local time and datetime at UTC time
    mergedLocalTimeSchedule: {} as Record<number, IDaySchedule>, // schedule that merges default and custom schedules, with hours at the user's local time
  }),

  computed: {
    customSchedule() {
      return useAppointmentProgramStore().schedule?.customSchedule || CUSTOM_SCHEDULE || [];
    },

    defaultSchedule() {
      return useAppointmentProgramStore().schedule?.defaultSchedule || DEFAULT_SCHEDULE;
    },
  },

  watch: {
    // TODO: remove. Time zone is not supposed to change during the lifecycle of this component
    timeZone(newZone) {
      if (newZone) {
        this.reloadSchedule();
      }
    },

    weekStartDate() {
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

      onChange(updateData: { start: ICalendarData, end: ICalendarData }) {
        this.weekStartDate = updateData.start.date;
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
               backgroundColor = day.custom ? 'green' : 'darkblue';
            }
          });
        }

        return { backgroundColor };
      },

      calculateSchedules() {
        const { scheduleWithLocalHours, mergedSchedule } = appointmentHelpers.calculateSchedule(this.defaultSchedule, this.customSchedule, this.timeZone, this.weekStartDate);
        this.localDefaultSchedule = scheduleWithLocalHours;
        this.mergedLocalTimeSchedule = mergedSchedule;
      },

      // TODO: for the POC the schedule needs to be reloaded when the dialog closes, but later we will simply reload the data,
      // since the dialogs for default and custom schedule will make Apply/Submit calls to the BE to update the schedule
      reloadSchedule() {
        this.mergedLocalTimeSchedule = {};
        this.localDefaultSchedule = {};
        this.calculateSchedules();
      },
    },

});
</script>

<style scoped lang="scss">
  ::v-deep .v-calendar-weekly__week {
    min-height: 70px;
  }
</style>
