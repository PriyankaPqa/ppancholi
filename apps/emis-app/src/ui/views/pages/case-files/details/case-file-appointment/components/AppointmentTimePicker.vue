<template>
  <v-radio-group v-model="bookedCalendarTime" class="my-0">
    <v-sheet rounded outlined>
      <v-calendar
        ref="calendar"
        v-model="date"
        hide-header
        short-intervals
        type="day"
        :events="availableSlots"
        :event-color="item => item.color"
        :event-text-color="item => item.textColor"
        :interval-minutes="+duration || 30"
        :interval-height="35"
        :first-time="firstTime"
        :interval-count="9 * (60 / (+duration || 30))"
        @change="getWeekStartDate">
        <template #event="data">
          <div class="availability-slot d-flex">
            <v-radio
              data-test="appointment_slot_selected"
              class="select-time-radio-btn"
              active-class="active"
              color="white"
              :label="getTimeSlotLabel(data.event)"
              :ripple=" false"
              off-icon="mdi-circle"
              :value="data.event" />
          </div>
        </template>
      </v-calendar>
    </v-sheet>
  </v-radio-group>
</template>

<script lang="ts">
import Vue from 'vue';
import { addMinutes, format, addDays } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { IDateRange, ITimeSlot } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';

export interface ICalendarEvent {
  name: string,
  start: Date,
  end: Date,
  color: string,
  timed?: boolean,
}

export default Vue.extend({
  name: 'AppointmentTimePicker',

  components: {
  },

  props: {
    duration: {
      type: String,
      default: '',
    },

    date: {
      type: String,
      required: true,
    },

    availabilities: {
      type: Array as ()=> IDateRange[],
      default: () => [] as IDateRange[],
    },

    bookedTime: {
      type: Object as ()=> IDateRange,
      default: () => null as IDateRange,
    },
  },

  data() {
    return {
      availableSlots: [] as ITimeSlot[],
      getLocalStringDate: helpers.getLocalStringDate,
      bookedCalendarTime: null as ICalendarEvent,
      weekStartDate: '',
      currentWeekDay: 0,
    };
  },

  computed: {
    firstTime(): string {
       if (this.availableSlots?.length && this.duration) {
        const minStart = Math.min(...this.availableSlots.map((s) => new Date(s.start).getTime()));
        return format(addMinutes(new Date(minStart), -(+this.duration)), 'HH:mm');
       }
      return this.availableSlots.length ? format(addMinutes(this.availableSlots[0].start as Date, -(+this.duration)), 'HH:mm') : '09:00';
    },
  },

  watch: {
    duration(newValue) {
      if (newValue) {
        this.calculateAvailableSlots();
      }
    },

    date(newValue) {
      if (newValue) {
        this.calculateAvailableSlots();
      }
    },

    bookedCalendarTime(newValue) {
      if (newValue) {
        this.$emit('update:bookedTime', { startDateTime: (newValue.start).toISOString(), endDateTime: (newValue.end).toISOString() });
      }
    },

 },

  created() {
    if (this.bookedTime?.startDateTime) {
      this.bookedCalendarTime = this.parseEventFromTimeSlot(new Date(this.bookedTime.startDateTime), new Date(this.bookedTime.endDateTime));
    }
    this.calculateAvailableSlots();
  },

  methods: {
    calculateAvailableSlots() {
      if (!this.duration) {
        return;
      }

      const slots = [] as ITimeSlot[];
      this.availabilities.forEach((a) => {
        let s = new Date(a.startDateTime);
        const end = new Date(a.endDateTime);
        while (s < end) {
          const e = addMinutes(s, +this.duration);

          if (e <= end) {
            slots.push(this.parseEventFromTimeSlot(s, e));
          }
          s = e;
        }
      });

      if (this.bookedTime?.startDateTime) {
        slots.push(this.bookedCalendarTime);
      }
      this.availableSlots = slots;
    },

    parseEventFromTimeSlot(start: Date, end:Date): ICalendarEvent {
      return {
        name: 'Available',
        start,
        end,
        color: 'white',
        timed: true,
      };
    },

    getTimeSlotLabel(event: ICalendarEvent) {
      return event.start === this.bookedCalendarTime?.start
      ? this.$t('caseFile.appointments.timePicker.selected')
      : this.$t('caseFile.appointments.timePicker.available');
    },

    getWeekStartDate(updateData: { start: { date: Date, weekday: number } }) {
        this.currentWeekDay = updateData.start.weekday;
        this.weekStartDate = format(addDays(utcToZonedTime(new Date(updateData.start.date), 'UTC'), -this.currentWeekDay), 'yyyy-MM-dd');
    },
  },
});
</script>

<style scoped lang="scss">

::v-deep .v-calendar-events .v-event-timed {
    border-left: none !important;
    border-right: none !important;
    border-top: 1px solid #e0e0e0 !important;
    border-bottom: none !important;
    border-radius: 0 !important;
  }

  ::v-deep .v-input--selection-controls__input {
    padding-left: 5px;;
    .v-icon {
      color: white !important;
    }
  }

  ::v-deep .v-label {
    font-size: 14px;
  }

  ::v-deep .v-calendar-daily__scroll-area {
    overflow-y: auto;
  }

  .availability-slot {
    margin-top: 2px;
    margin-left: 2px;
    height: 90%;
    background:  var(--v-primary-lighten1);
    border-radius: 4px;
    font-weight: bold;
    &:has(> .active){
      background:  var(--v-primary-darken1);
      .v-radio > .v-label {
        color: white;
      }
    }

  }

  ::v-deep .availability-slot .active.select-time-radio-btn .v-label {
      color: white;
  }

  ::v-deep .availability-slot .select-time-radio-btn {
    width: 100%;
    +.active .v-label {
      color: white;
    }
  }

</style>
