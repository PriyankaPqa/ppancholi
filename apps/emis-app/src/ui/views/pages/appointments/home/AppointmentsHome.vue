<template>
  <div class="pa-4">
    Appointments
    <v-toolbar
      flat>
      <v-btn
        outlined
        class="mr-4"
        color="grey darken-2"
        @click="setToday">
        Today
      </v-btn>
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
      <v-select
        v-model="timeZone"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parseISO } from 'date-fns';
import { mockAppointment, IAppointment } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';
import { RcDialog } from '@libs/component-lib/components';

const APPOINTMENTS = [
  mockAppointment({ startDate: '2024-05-15T15:00:00.000Z',
  endDate: '2024-05-15T16:00:00.000Z',
  attendeeId: 'Jane Blue',
}),
  mockAppointment({ serviceOptionId: 'service-id-2' }),
];

export interface ICalendarEvent {
  name: string,
  start: Date,
  end: Date,
  color: string,
  timed?: boolean,
}

export default Vue.extend({
  name: 'AppointmentsHome',
  components: {
    RcDialog,
  },
  data: () => ({
    focus: '',
      type: 'month',
      types: ['month', 'week', 'day', '4day'],
      mode: 'column',
      modes: ['stack', 'column'],
      weekday: [1, 2, 3, 4, 5, 6, 0],
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
      timeZone: '',
  }),

  watch: {
    timeZone(newZone) {
      if (newZone) {
        this.getEvents();
      }
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

      getEvents() {
        const events = this.parseEventsFromAppointments(this.appointments);
        this.events = events;
      },
      getEventColor(event: ICalendarEvent) {
        return event.color;
      },
      rnd(a: number, b: number) {
        return Math.floor((b - a + 1) * Math.random()) + a;
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

    },
});
</script>

<style scoped lang="scss">
  ::v-deep .v-calendar-weekly__week {
    min-height: 70px;
  }
</style>
