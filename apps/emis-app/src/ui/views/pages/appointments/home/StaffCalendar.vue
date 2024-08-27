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
          <v-list-item @click="type = 'category'">
            <v-list-item-title>Day</v-list-item-title>
          </v-list-item>
          <v-list-item @click="type = 'week'">
            <v-list-item-title>Week</v-list-item-title>
          </v-list-item>
          <v-list-item @click="type = 'month'">
            <v-list-item-title>Month</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-sheet outlined height="500">
      <v-calendar
        ref="calendar"
        v-model="focus"
        :weekdays="weekday"
        :type="type"
        :events="events"
        :categories="staffMembers"
        :category-text="item => item.displayName"
        category-show-all
        :event-overlap-mode="'stack'"
        :event-overlap-threshold="30"
        :event-color="item => item.color"
        :event-text-color="item => item.textColor"
        :interval-style="getIntervalStyle"
        :interval-minutes="30"
        :interval-height="30"
        :first-time="'00:00'"
        :interval-count="48"
        @change="getWeekStartDate"
        @click:event="showEvent" />
    </v-sheet>
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
        <div class="d-flex flex-column">
          <span>{{ `Start: ${helpers.getLocalStringDate(selectedEvent.start, 'local', 'PP p')} - End: ${helpers.getLocalStringDate(selectedEvent.end, 'local', 'PP p')}` }} </span>
          <span>  Meeting URL: {{ selectedEvent.onlineMeetingUrl }} </span>
        </div>
      </div>
      <div v-else>
        Date: {{ selectedEvent }}
      </div>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parseISO, format, addDays } from 'date-fns';
import { IAppointment, IDaySchedule, IStaffMemberAvailability } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';
import { utcToZonedTime } from 'date-fns-tz';
import { RcDialog } from '@libs/component-lib/components';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { usePersonStore } from '@/pinia/person/person';
import { useUserStore } from '@/pinia/user/user';
import { IMemberEntity } from '@libs/entities-lib/household-create';
import { APPOINTMENTS, APPOINTMENT_PROGRAM_TIMEZONE, STAFF_MEMBER_IDS, STAFF_AVAILABILITIES } from './mocks';
import appointmentHelpers from '../utils/appointmentHelpers';

export interface ICalendarEvent extends IAppointment {
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
  category?: any,
}

export default Vue.extend({
  name: 'StaffCalendar',
  components: {
    RcDialog,
  },
  data: () => ({
    focus: '',
    type: 'category',
    types: ['month', 'week', 'category'],
    mode: 'column',
    modes: ['stack', 'column'],
    weekday: [0, 1, 2, 3, 4, 5, 6],
    value: '',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      category: 'Day',
    },
    // events: [] as ICalendarEvent[],
    colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
    appointments: APPOINTMENTS,
    selectedEvent: {} as ICalendarEvent,
    showDialog: false,
    eventClicked: false,
    helpers,
    timeZone: APPOINTMENT_PROGRAM_TIMEZONE,
    localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currentWeekDay: 0,
    weekStartDate: '',
    myAppointmentsOnly: false,
    staffSchedule: [],
  }),

  computed: {
    staffMemberIds(): string[] {
      return STAFF_MEMBER_IDS;
    },

    staffMembers(): IUserAccountMetadata[] {
      return useUserAccountMetadataStore().getByIds(this.staffMemberIds, true);
    },

    staffAvailabilities(): IStaffMemberAvailability[] {
      return STAFF_AVAILABILITIES;
    },

    attendees(): IMemberEntity[] {
      const personIds = this.appointments.map((a) => a.attendeeId);
      return usePersonStore().getByIds(personIds, true);
    },

    events(): ICalendarEvent[] {
      return this.parseEventsFromAppointments(this.appointments);
    },

    userId() {
     return useUserStore().getUserId();
    },
  },

  watch: {
    staffMemberIds(newValue) {
      useUserAccountMetadataStore().fetchByIds(newValue, true);
      this.fetchAttendees();
      this.calculateStaffSchedules();
    },

    weekStartDate(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.calculateStaffSchedules();
      }
    },

  },

  async created() {
    await useUserAccountMetadataStore().fetchByIds(this.staffMemberIds, true);
    await this.fetchAttendees();
    this.calculateStaffSchedules();
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
      this.type = 'category';
    },

    getWeekStartDate(updateData: { start: ICalendarData }) {
      if (this.type === 'category') {
        this.currentWeekDay = updateData.start.weekday;
        this.weekStartDate = format(addDays(utcToZonedTime(new Date(updateData.start.date), 'UTC'), -this.currentWeekDay), 'yyyy-MM-dd');
      }
      this.scrollToFirstScheduleHour();
    },

    parseEventsFromAppointments(appointments: IAppointment[]): ICalendarEvent[] {
      return appointments.map((a) => {
        const attendeeIdentity = this.attendees.find((m) => m.id === a.attendeeId)?.identitySet;
        return {
        ...a,
        name: attendeeIdentity ? `${attendeeIdentity.firstName} ${attendeeIdentity.lastName}` : '',
        start: parseISO(a.startDate as string),
        end: parseISO(a.endDate as string),
        color: this.userId === a.staffMemberId ? 'primary lighten-1' : 'white',
        textColor: 'primary darken-2',
        timed: true,
        category: this.staffMembers.find((m) => m.id === a.staffMemberId)?.displayName,
      };
});
    },

    showEvent(data: any) {
      this.eventClicked = true;
      this.showDialog = true;
      this.selectedEvent = data.event;
    },

    getIntervalStyle(interval: ICalendarData) {
      let backgroundColor = 'white'; // 'var(--v-primary-lighten2)';
      const memberId = interval.category?.id || (this.userId && this.myAppointmentsOnly);
      const day = this.staffSchedule.find((s) => s.id === memberId)?.schedule?.[interval.weekday] as IDaySchedule;
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
              backgroundColor = 'var(--v-primary-lighten2)';
          }
        });
      }

      return { backgroundColor };
    },

    // There is an issue with v-calendar scrollToTime method for type category  https://github.com/vuetifyjs/vuetify/issues/14589
    async scrollToTime(time:string) {
      const y = this.$refs.calendar.timeToY(time);
      if (y === false || !this.$refs.calendar) {
        return;
      }
      await this.$nextTick();
      this.$refs.calendar.$el.scrollTop = y;
    },

    fetchAttendees() {
      const personIds = this.appointments.map((a) => a.attendeeId);
      usePersonStore().fetchByIds(personIds, true);
    },

    calculateStaffSchedules() {
      // TODO - check if the member uses program schedule( useBusinessHours: false ?)

      this.staffSchedule = this.staffAvailabilities.map((av) => ({
        id: av.staffMemberId,
        schedule: appointmentHelpers.calculateSchedule(av.defaultbusinessHours, av.customDateRanges, this.timeZone, this.weekStartDate).mergedSchedule,
      }));

      this.scrollToFirstScheduleHour();
    },

    async scrollToFirstScheduleHour() {
      if (this.type === 'category') {
        const firstHour = (this.staffSchedule.map((s) => s.schedule[this.currentWeekDay].timeSlots?.[0]?.start).filter((x) => x)).sort()[0] || '09:00';
        await this.$nextTick();
        this.scrollToTime(firstHour);
      } else if (this.type === 'week') {
        const firstHour = '09:00'; // TODO get first hour from business default schedule or follow story AC
        // const firstHour = (this.staffSchedule.map((s) => Object.keys(s.schedule).map((day) => s.schedule[day].timeSlots?.[0]?.start).filter((x) => x)).flat()).sort()[0] || '09:00';
        await this.$nextTick();
        this.$refs.calendar.scrollToTime(firstHour);
      }
    },

  },

});
</script>

<style scoped lang="scss">
  ::v-deep .v-calendar-weekly__week {
    min-height: 70px;
  }
</style>
