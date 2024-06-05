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
    <div v-for="day in Object.keys(localSchedule)" :key="day">
      <template v-if="localSchedule && localSchedule[day].timeSlots.length">
        <strong>{{ DayOfWeek[day] }} {{ localSchedule[day].date }}</strong>
        <div v-for="(timeSlot, timeSlotIndex) in localSchedule[day].timeSlots" :key="`${day}_${timeSlotIndex}`">
          <div v-if="localSchedule[day].timeSlots[timeSlotIndex]" class="d-flex">
            <v-select
              v-model="localSchedule[day].timeSlots[timeSlotIndex].start"
              :items="INTERVALS"
              dense
              class="select mx-10"
              :menu-props="{ maxWidth: 200 }"
              :item-value="(item) => item.value"
              @change="updateTime($event, day, timeSlotIndex, 'start')" />
            <v-select-a11y
              v-model="localSchedule[day].timeSlots[timeSlotIndex].end"
              :items="INTERVALS"
              dense
              class="select"
              :item-value="(item) => item.value"
              @change="updateTime($event, day, timeSlotIndex, 'end')" />
          </div>
        </div>
      </template>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { format } from 'date-fns';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog, VSelectA11y } from '@libs/component-lib/components';
import { DayOfWeek, IDaySchedule, IDateRange, ITimeSlot } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';

// Helper just for the POC. TODO: improve this function to take different time intervals
const createHalfHourIntervals = (fromArg: string, untilArg: string) => {
  const until = Date.parse(`01/01/2001 ${untilArg}`);
  const from = Date.parse(`01/01/2001 ${fromArg}`);
  const max = (Math.abs(until - from) / (60 * 60 * 1000)) * 2; // NOT the good function, only splits in 30 minutes interval
  let time = new Date(from);
  const intervals = [];

  for (let i = 0; i <= max; i += 1) {
    intervals.push(new Date(time));
    time = new Date(time.setMinutes(time.getMinutes() + 30));
  }

  return intervals;
};

const INTERVALS = createHalfHourIntervals('00:00', '24:00').map((i) => ({ text: format(i, 'hh:mm a'), value: format(i, 'HH:mm') }));

export default Vue.extend({
  name: 'CustomSchedule',

  components: {
    RcDialog,
    VSelectA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    defaultSchedule: {
      type: Array as () => IDaySchedule[],
      required: true,
    },

    mergedLocalTimeSchedule: {
      type: Array as () => IDaySchedule[],
       default: () => [] as IDaySchedule[],
    },

    customSchedule: {
      type: Array as () => IDateRange[],
      default: () => [] as IDateRange[],
    },

    date: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      INTERVALS,
      DayOfWeek,
    };
  },

  computed: {
    // Gets the start and end UTC dates for the week, local midnight to local midnight
    weekRange(): { start: Date, end:Date } {
      const utcRangeStart = new Date(`${this.date} 0:00`);
      const utcRangeEnd = new Date(utcRangeStart.getTime());
      utcRangeEnd.setDate(utcRangeEnd.getDate() + 7);

      return { start: utcRangeStart, end: utcRangeEnd };
    },

    localSchedule(): Record<number, IDaySchedule> {
      return _cloneDeep(this.mergedLocalTimeSchedule);
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    getLocalTime(date: string): string {
      return format(new Date(date), 'hh:mm a ');
    },

    submit() {
      const currentCustomSchedule = this.calculateNewCustomSchedule();
      const otherCustomSchedule = this.customSchedule.filter((sch) => new Date(sch.end) < this.weekRange.start || new Date(sch.start) > this.weekRange.end);
      // merges the new custom schedule with all the rest of the custom schedule data that is outside the current week
      const customScheduleToSubmit = [...currentCustomSchedule, ...otherCustomSchedule];

      // TODO: replace this with the actual BE call to update the schedule (send the whole default and custom schedule back)
      useAppointmentProgramStore().customSchedule = customScheduleToSubmit;
      this.$emit('reloadSchedule');
      this.close();
    },

    // change the UTC datetime of the time slot with the new value from the dropdown
    updateTime(value: string, dayOfWeek: number, timeSlotIndex: number, position: string) {
      const date = this.localSchedule[dayOfWeek].date;
      const newTime = new Date(`${date} ${value}`).toISOString();
      this.localSchedule[dayOfWeek].timeSlots[timeSlotIndex][`${position}DateTime`] = newTime;
    },

    // compares for each day the default schedule time slots with all the current time slots, and if the current are different than the default ones,
    // adds them to the custom schedule list, as they are the custom schedule for this week.
    calculateNewCustomSchedule(): IDateRange[] {
      const customSchedules = [] as IDateRange[];
      Object.keys(this.localSchedule).forEach((day) => {
        const currentDaySchedule = this.localSchedule[+day];

        const correspondingDefaultDay = this.defaultSchedule.find((sch) => sch.date === currentDaySchedule.date);
        // TODO IMPORTANT!: if the default day exists but the custom day has no time slots, there needs to be a custom day added
        // with the start and end date the same (midnight) - to signal that the custom schedule for that day is no schedule at all

        // if there are a different number of time slots for default and current schedule, we know it's a custom day schedule directly, no need to compare times
        if (!correspondingDefaultDay || correspondingDefaultDay.timeSlots.length !== currentDaySchedule.timeSlots.length) {
          customSchedules.push(...currentDaySchedule.timeSlots.map((s:ITimeSlot) => ({ start: s.startDateTime, end: s.endDateTime })));
          return;
        }

        // compare utc start and end time for each default and current slot
        for (let i = 0; i < currentDaySchedule.timeSlots.length; i += 1) {
          if (currentDaySchedule.timeSlots[i].startDateTime !== correspondingDefaultDay.timeSlots[i].startDateTime
          || currentDaySchedule.timeSlots[i].endDateTime !== correspondingDefaultDay.timeSlots[i].endDateTime) {
            customSchedules.push(...currentDaySchedule.timeSlots.map((s:ITimeSlot) => ({ start: s.startDateTime, end: s.endDateTime })));
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
