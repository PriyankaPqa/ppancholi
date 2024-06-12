<!-- POC Component for updating the schedule for a staff member -->

<template>
  <div>
    <div v-for="day in Object.keys(scheduleCopy)" :key="day">
      <strong>{{ DayOfWeek[+day] }} {{ scheduleCopy[+day].date }}</strong>
      <div>
        <template v-if="scheduleCopy[+day].timeSlots.length">
          <div v-for="(timeSlot, timeSlotIndex) in scheduleCopy[+day].timeSlots" :key="`${day}_${timeSlotIndex}`">
            <div class="d-flex">
              <v-select-a11y
                :value="timeSlot.start"
                :items="INTERVALS"
                dense
                class="select mx-10"
                menu-props="auto"
                :item-value="(item) => item.value"
                @change="updateTime($event, +day, timeSlotIndex, 'start')" />
              <v-select-a11y
                :value="timeSlot.end"
                :items="INTERVALS"
                menu-props="auto"
                dense
                class="select"
                :item-value="(item) => item.value"
                @change="updateTime($event, +day, timeSlotIndex, 'end')" />
              <v-btn icon data-test="delete-link" :aria-label="$t('common.delete')" @click="deleteSlot(+day, timeSlotIndex)">
                <v-icon size="24" color="grey darken-2">
                  mdi-delete
                </v-icon>
              </v-btn>
              <v-btn
                v-if="timeSlotIndex === scheduleCopy[+day].timeSlots.length - 1"
                icon
                data-test="delete-link"
                :aria-label="$t('common.delete')"
                @click="addSlot(+day)">
                <v-icon size="24" color="grey darken-2">
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </div>
        </template>

        <div v-else>
          N/A
          <v-btn icon data-test="delete-link" :aria-label="$t('common.delete')" @click="addSlot(+day)">
            <v-icon size="24" color="grey darken-2">
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VSelectA11y } from '@libs/component-lib/components';
import { DayOfWeek, IDaySchedule, ITimeSlot } from '@libs/entities-lib/appointment';
import appointmentHelpers from './appointmentHelpers';

const INTERVALS = appointmentHelpers.createDropdownTimeIntervals('00:00', '24:00');

export default Vue.extend({
  name: 'AvailabilitySchedule',

  components: {
    VSelectA11y,
  },

  props: {
    schedule: {
      type: Object as () => Record<number, IDaySchedule>,
      required: true,
    },
  },

  data() {
    return {
      INTERVALS,
      DayOfWeek,
      scheduleCopy: _cloneDeep(this.schedule),
    };
  },

  watch: {
    scheduleCopy: {
      handler(newData) {
        this.$emit('update:schedule', newData);
      },
      deep: true,
    },
  },

  methods: {
    // change the UTC datetime of the time slot with the new value , calculated from the new selected time
    updateTime(value: string, dayOfWeek: number, timeSlotIndex: number, position: string) {
      const date = this.scheduleCopy[dayOfWeek].date;
      const newTime = new Date(`${date} ${value}`).toISOString();
      let updatedSlot = this.scheduleCopy[dayOfWeek].timeSlots[timeSlotIndex];
      if (updatedSlot) {
        updatedSlot = {
          ...updatedSlot,
          [`${position}DateTime` as 'startDateTime' | 'endDateTime']: newTime,
          [position]: value,
        };
      }
      this.scheduleCopy[dayOfWeek].timeSlots.splice(timeSlotIndex, 1, updatedSlot);
    },

    // TODO: when adding a slot, if the previous slot ends before 5pm, set the start time of the new slot to the end time of the last slot
    // (copy behavior from MSBooking)
    addSlot(day: number) {
      const slotDate = this.scheduleCopy[day].date;
      const newSlot:ITimeSlot = {
        start: '09:00',
        end: '17:00',
        startDateTime: new Date(`${slotDate} 9:00`).toISOString(),
        endDateTime: new Date(`${slotDate} 17:00`).toISOString(),
      };
      this.scheduleCopy[day].timeSlots.push(newSlot);
    },

    deleteSlot(day: number, index: number) {
      this.scheduleCopy[day].timeSlots.splice(index, 1);
    },
  },

});
</script>

<style lang="scss" scoped>
  .select {
    max-width: 150px;
  }
</style>
