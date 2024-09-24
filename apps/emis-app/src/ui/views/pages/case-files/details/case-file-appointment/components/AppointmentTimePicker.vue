<template>
  <div>
    <p class="rc-body16 fw-bold mb-2">
      {{ $t('appointment.availabilitesFor', { date: getLocalStringDate(date, 'local', 'PP') }) }} :
    </p>
    <v-radio-group v-model="bookedTime" class="my-0">
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
          :interval-minutes="+duration"
          :interval-height="35"
          :first-time="firstTime"
          :interval-count="9 * (60 / +duration)"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { addMinutes, format, addDays } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { IDateRange, ITimeSlot } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';
import { APPOINTMENT_PROGRAM_TIMEZONE } from '../../../../appointments/home/mocks';

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
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    availabilities: {
      type: Array as ()=> IDateRange[],
      required: true,
    },
  },

  data() {
    return {
      availableSlots: [] as ITimeSlot[],
      getLocalStringDate: helpers.getLocalStringDate,
      bookedTime: null as ICalendarEvent,
      timeZone: APPOINTMENT_PROGRAM_TIMEZONE,
      weekStartDate: '',
      currentWeekDay: 0,
      firstTime: '09:00',
    };
  },

  computed: {
    // firstTime(): string {
    //   return this.availableSlots[0]?.start ? format(addMinutes(this.availableSlots[0].start as Date, -(+this.duration)), 'HH:mm') : '09:00';
    // },
  },

  watch: {
    duration(newValue) {
      if (newValue) {
        this.calculateAvailableSlots();
        // this.calculateFirstTimeInterval();
      }
    },

    date(newValue) {
      if (newValue) {
        this.calculateAvailableSlots();
      }
    },

 },

  created() {
    this.calculateAvailableSlots();
  },

  methods: {
    calculateAvailableSlots() {
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
      const first = event.start === this.bookedTime?.start ? 'Selected  TBT' : 'Available TBT';
      return `${first} ${format(event.start, 'hh:mm')}-${format(event.end, 'hh:mm')}`;
    },

    getWeekStartDate(updateData: { start: { date: Date, weekday: number } }) {
        this.currentWeekDay = updateData.start.weekday;
        this.weekStartDate = format(addDays(utcToZonedTime(new Date(updateData.start.date), 'UTC'), -this.currentWeekDay), 'yyyy-MM-dd');
        this.calculateFirstTimeInterval();
      },

      calculateFirstTimeInterval() {
      // if (this.selectedStaffMember) {
      //   // TODO: call the BE with the selected staff member id
      //   const staffAvailability = mockAppointmentStaffMember({ userAccountId: this.selectedStaffMember.id });
      //   const staffSchedule = appointmentHelpers.calculateSchedule(
      //     staffAvailability.defaultbusinessHours,
      //     staffAvailability.customDateRanges as ITimeSlot[],
      //     this.timeZone,
      //     this.weekStartDate,
      //   ).mergedSchedule;

      //   const daySchedule = staffSchedule[this.currentWeekDay];
      //   const scheduleStart = daySchedule.timeSlots?.[0]?.startDateTime;
      //   this.firstTime = scheduleStart ? format(addMinutes(parseISO(scheduleStart as string), -(+this.duration)), 'HH:mm') : '09:00';
      // }
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
