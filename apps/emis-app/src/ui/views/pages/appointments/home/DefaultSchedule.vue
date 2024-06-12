<!-- POC Component for displaying the setting custom schedule for a staff member -->

<template>
  <rc-dialog
    :show.sync="show"
    title="DEFAULT SCHEDULE EN"
    content-only-scrolling
    content-padding="10"
    persistent
    fullscreen
    :submit-action-label="$t('common.apply')"
    @close="close"
    @cancel="close"
    @submit="submit">
    <availability-schedule :schedule.sync="clonedLocalSchedule" />
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog } from '@libs/component-lib/components';
import { IDaySchedule } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import appointmentHelpers from './appointmentHelpers';
import AvailabilitySchedule from './AvailabilitySchedule.vue';

export default Vue.extend({
  name: 'DefaultSchedule',

  components: {
    RcDialog,
    AvailabilitySchedule,
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

    rangeStartDate: {
      type: String,
      default: '',
    },

    programTimeZone: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      clonedLocalSchedule: _cloneDeep(this.defaultSchedule),
    };
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    submit() {
      // when we submit the default schedule, the hours need to be recalculated from the user's local time to the appointment program time zone
      const defaultScheduleToAppointmentProgramTime = appointmentHelpers.setDefaultScheduleToTimeZoneHours(this.clonedLocalSchedule, this.programTimeZone, this.rangeStartDate);
      // the local schedule is an object, the payload needs to be an array
      const defaultSchedulePayload = Object.keys(defaultScheduleToAppointmentProgramTime).map((day) => ({
        day: defaultScheduleToAppointmentProgramTime[+day].day,
        timeSlots: defaultScheduleToAppointmentProgramTime[+day].timeSlots.map((slot) => ({ start: slot.start, end: slot.end })),
      }));
      // TODO: replace this with the actual BE call to update the schedule (send the whole default and custom schedule back)
      useAppointmentProgramStore().schedule = { ...useAppointmentProgramStore().schedule, defaultSchedule: defaultSchedulePayload };
      this.$emit('reloadSchedule');
      this.close();
    },
  },

});
</script>

<style lang="scss" scoped>
  .select {
    max-width: 150px;
  }
</style>
