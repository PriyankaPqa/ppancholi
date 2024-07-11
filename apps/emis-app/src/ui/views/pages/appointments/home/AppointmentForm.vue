<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row class="mt-4">
            <v-col cols="6" class="pb-0">
              <v-select-with-validation
                v-model="selectedStaffMember"
                data-test="selected-staff-member"
                attach
                :label="`${$t('appointment.selectAttendee')} *`"
                :item-value="(item) => item.id"
                :item-text="(item) => getStaffMemberName(item)"
                :items="staffMembers"
                :rules="rules.staff" />
            </v-col>
            <v-col cols="6" class="pb-0">
              <v-select-with-validation
                v-model="duration"
                data-test="appointment-duration"
                attach
                :label="`${$t('appointment.duration')} *`"
                :items="appointmentDurations"
                :rules="rules.duration" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="pt-0">
              <div class="grey-container py-4 px-8">
                <p class="rc-body16 fw-bold">
                  {{ $t('appointment.choseTime') }}
                </p>
                <v-date-field-with-validation
                  v-model="selectedDate"
                  data-test="appointment-selected-date"
                  :locale="$i18n.locale"
                  :rules="rules.selectedDate"
                  :label="`${$t('appointment.selectDate')} *`"
                  :min="today" />
                <template v-if="selectedDate">
                  <p class="rc-body16 fw-bold mb-2">
                    {{ $t('appointment.availabilitesFor', { date: getLocalStringDate(selectedDate, 'local', 'PP') }) }} :
                  </p>
                  <v-radio-group v-model="bookedTime" class="my-0">
                    <v-sheet rounded outlined>
                      <v-calendar
                        ref="calendar"
                        v-model="selectedDate"
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
                </template>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { addMinutes, format, addDays, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import {
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Appointment, IDateRange, ITimeSlot, mockStaffMemberAvailability } from '@libs/entities-lib/appointment';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserStore } from '@/pinia/user/user';
import { BaseEntity } from '@libs/entities-lib/base';
import helpers from '@/ui/helpers/helpers';

import { IDaySchedule } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { STAFF_MEMBER_IDS, STAFF_MEMBER_AVAILABILITIES, APPOINTMENT_PROGRAM_TIMEZONE } from './mocks';
import appointmentHelpers from './appointmentHelpers';

export interface ICalendarEvent {
  name: string,
  start: Date,
  end: Date,
  color: string,
  timed?: boolean,
}

export default Vue.extend({
  name: 'ReferralForm',

  components: {
    VSelectWithValidation,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    appointment: {
      type: Object as () => Appointment,
      required: true,
    },
  },

  data() {
    const localAppt = new Appointment(this.appointment);

    return {
      localAppt,
      selectedStaffMember: null as IUserAccountMetadata,
      selectedDate: '',
      getLocalStringDate: helpers.getLocalStringDate,
      availableSlots: [] as ITimeSlot[],
      duration: '30', // TODO get this from selection
      bookedTime: null as ICalendarEvent,
      appointmentDurations: ['15', '20', '30', '60'],
      timeZone: APPOINTMENT_PROGRAM_TIMEZONE,
      weekStartDate: '',
      currentWeekDay: 0,
      staffMemberSchedule: null as IDaySchedule,
      firstTime: '',
    };
  },

  computed: {

    rules(): Record<string, unknown> {
      return {
        staff: {
          required: true,
        },

      };
    },

    staffMemberIds(): string[] {
      return STAFF_MEMBER_IDS;
    },

    staffMembers(): IUserAccountMetadata[] {
      const nextAvailableMember = new BaseEntity();
      nextAvailableMember.id = 'next-available-member';
      return useUserAccountMetadataStore().getByIds(this.staffMemberIds, true).concat([nextAvailableMember]);
    },

    today(): string {
      return helpers.getLocalStringDate(new Date(), 'local');
    },

    // firstTime(): string {
    //   return this.availableSlots[0]?.start ? format(addMinutes(this.availableSlots[0].start as Date, -(+this.duration)), 'HH:mm') : '09:00';
    // },
  },

  watch: {
    localReferral: {
      handler(newAppointment) {
        this.$emit('update:appointment', newAppointment);
      },
      deep: true,
    },

    selectedDate(newValue) {
      if (newValue && this.selectedStaffMember) {
        this.getStaffMemberAvailability();
      }
    },

    duration(newValue) {
      if (newValue) {
        this.getStaffMemberAvailability();
        this.calculateFirstTimeInterval();
      }
    },

 },

  async created() {
    await useUserAccountMetadataStore().fetchByIds(this.staffMemberIds, true);
    // this.getStaffMemberAvailability();
  },

  methods: {
    getStaffMemberAvailability() {
      // TODO: Call BE for availability, pass this.selectedStaffMember.id. if id === 'next-available-member', send all ids
      const staffMemberAvailabilities = STAFF_MEMBER_AVAILABILITIES;
      this.availableSlots = this.calculateAvailableSlots(staffMemberAvailabilities);
    },

    getStaffMemberName(item: IUserAccountMetadata): string {
      if (item.id === 'next-available-member') {
        return 'Next available member TBT';
      }
      const currentUserId = useUserStore().getUserId();
      if (item.id === currentUserId) {
        return 'MYSELF TBT';
      }
      if (item) {
        return item.displayName;
      }
      return '';
    },

    calculateAvailableSlots(availabilities: IDateRange[]): ITimeSlot[] {
      const slots = [] as ITimeSlot[];
      availabilities.forEach((a) => {
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

      return slots;
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
      if (this.selectedStaffMember) {
        // TODO: call the BE with the selected staff member id
        const staffAvailability = mockStaffMemberAvailability({ staffMemberId: this.selectedStaffMember.id });
        const staffSchedule = appointmentHelpers.calculateSchedule(
          staffAvailability.defaultbusinessHours,
          staffAvailability.customDateRanges,
          this.timeZone,
          this.weekStartDate,
        ).mergedSchedule;

        const daySchedule = staffSchedule[this.currentWeekDay];
        const scheduleStart = daySchedule.timeSlots?.[0]?.startDateTime;
        this.firstTime = scheduleStart ? format(addMinutes(parseISO(scheduleStart as string), -(+this.duration)), 'HH:mm') : '09:00';
}
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
