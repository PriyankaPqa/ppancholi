<!-- POC Component for displaying the setting custom schedule for a staff member -->

<template>
  <rc-dialog
    :show.sync="show"
    title="CUSTOM SCHEDULE EN"
    content-only-scrolling
    content-padding="10"
    persistent
    fullscreen
    :submit-action-label="$t('common.apply')"
    @close="close"
    @cancel="close"
    @submit="submit">
    <availability-hours :schedule.sync="localSchedule" />
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog } from '@libs/component-lib/components';
import { IDaySchedule, IDateRange, ITimeSlot } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import appointmentHelpers from '../utils/appointmentHelpers';
import AvailabilityHours from '../components/AvailabilityHours.vue';

export default Vue.extend({
  name: 'CustomSchedule',

  components: {
    RcDialog,
    AvailabilityHours,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    defaultSchedule: {
      type: Object as () => Record<number, IDaySchedule>,
      required: true,
    },

    mergedLocalTimeSchedule: {
      type: Object as () => Record<number, IDaySchedule>,
        required: true,
    },

    customSchedule: {
      type: Array as () => IDateRange[],
      required: true,
    },

    rangeStartDate: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      localSchedule: _cloneDeep(this.mergedLocalTimeSchedule),
    };
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    submit() {
      const currentCustomSchedule = this.calculateNewCustomSchedule();
      const weekRange = appointmentHelpers.weekRange(this.rangeStartDate);
      const otherCustomSchedule = this.customSchedule.filter((sch) => new Date(sch.endDateTime) < weekRange.start || new Date(sch.startDateTime) > weekRange.end);
      // merges the new custom schedule with all the rest of the custom schedule data that is outside the current week
      const customScheduleToSubmit = [...currentCustomSchedule, ...otherCustomSchedule];

      // TODO: replace this with the actual BE call to update the schedule (send the whole default and custom schedule back)
      useAppointmentProgramStore().schedule = { ...useAppointmentProgramStore().schedule, customSchedule: customScheduleToSubmit };
      this.$emit('reloadSchedule');
      this.close();
    },

    // compares for each day the default schedule time slots with all the current time slots, and if the current are different than the default ones,
    // adds them to the custom schedule list, as they are the custom schedule for this week.
    calculateNewCustomSchedule(): IDateRange[] {
      const customSchedules = [] as IDateRange[];
      Object.keys(this.localSchedule).forEach((day) => {
        const currentDaySchedule = this.localSchedule[+day];

        // THe day in the default schedule that corresponds to the current day schedule
        const correspondingDefaultDay = this.defaultSchedule[+day];

        // if the default day has time slots but the custom day has no time slots, there needs to be a custom day added
        // with the start and end date the same (midnight) - to signal that the custom schedule for that day is no schedule at all
        if (!currentDaySchedule.timeSlots.length && !!correspondingDefaultDay.timeSlots.length) {
          const midnight = new Date(`${correspondingDefaultDay.date} 0:00`).toISOString();
          customSchedules.push({ startDateTime: midnight, endDateTime: midnight });
        }

        // if there are a different number of time slots for default and current schedule, we know it's a custom day schedule directly, no need to compare times
        if (correspondingDefaultDay.timeSlots.length !== currentDaySchedule.timeSlots.length) {
          customSchedules.push(...currentDaySchedule.timeSlots.map((s:ITimeSlot) => ({ startDateTime: s.startDateTime, endDateTime: s.endDateTime })));
          return;
        }

        // compare utc start and end time for each default and current slot and only add the custom schedule of the whole day if they differ
        for (let i = 0; i < currentDaySchedule.timeSlots.length; i += 1) {
          if (currentDaySchedule.timeSlots[i].startDateTime !== correspondingDefaultDay.timeSlots[i].startDateTime
          || currentDaySchedule.timeSlots[i].endDateTime !== correspondingDefaultDay.timeSlots[i].endDateTime) {
            customSchedules.push(...currentDaySchedule.timeSlots.map((s:ITimeSlot) => ({ startDateTime: s.startDateTime, endDateTime: s.endDateTime })));
            break;
          }
        }
      });

      return customSchedules;
    },

  },

});
</script>

<style lang="scss" scoped>
  .select {
    max-width: 150px;
  }
</style>
