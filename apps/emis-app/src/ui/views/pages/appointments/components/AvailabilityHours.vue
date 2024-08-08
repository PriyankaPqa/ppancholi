<template>
  <div>
    <message-box
      v-if="showError"
      icon="mdi-alert"
      data-test="appointments-availability-hours-error"
      :message=" $t('appointments.availabilityHours.error')" />
    <v-sheet
      rounded
      outlined
      class="mb-4">
      <v-simple-table data-test="appointments-availability-hours-table">
        <thead>
          <tr>
            <th><span class="fw-bold rc-body14">{{ $t('appointments.scheduleHours.day') }}</span></th>
            <th><span class="fw-bold rc-body14">{{ $t('appointments.scheduleHours.from') }}</span></th>
            <th><span class="fw-bold rc-body14">{{ $t('appointments.scheduleHours.to') }}</span></th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody v-for="day in Object.keys(scheduleCopy)" :key="day" class="border">
          <template v-if="scheduleCopy[+day].timeSlots.length">
            <tr v-for="(timeSlot, timeSlotIndex) in scheduleCopy[+day].timeSlots" :key="`${day}_${timeSlotIndex}`">
              <td>
                <div v-if="timeSlotIndex === 0" :data-test="`appointments-availability-hours_day_${day}_${timeSlotIndex}`">
                  {{ $t(`enums.DayOfWeek.${DayOfWeek[+day]}`) }}
                </div>
              </td>
              <td class="px-0 py-2 select-cell">
                <v-select-a11y
                  :value="timeSlot.start"
                  :items="INTERVALS"
                  outlined
                  dense
                  hide-details
                  class="select"
                  menu-props="auto"
                  :data-test="`appointments-availability-hours_${day}_${timeSlotIndex}_start`"
                  :item-value="(item) => item.value"
                  @change="updateTime($event, +day, timeSlotIndex, 'start')" />
              </td>
              <td class="px-0 py-2 select-cell">
                <v-select-a11y
                  :value="timeSlot.end"
                  :items="INTERVALS"
                  :data-test="`appointments-availability-hours_${day}_${timeSlotIndex}_end`"
                  menu-props="auto"
                  outlined
                  hide-details
                  dense
                  class="select"
                  :item-value="(item) => item.value"
                  @change="updateTime($event, +day, timeSlotIndex, 'end')" />
              </td>
              <td class="px-0 py-1 action-cell">
                <v-btn icon :data-test="`delete-time-slot_${day}_${timeSlotIndex}`" :aria-label="$t('common.delete')" @click="deleteSlot(+day, timeSlotIndex)">
                  <v-icon size="24" color="grey darken-2">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </td>
              <td class="px-0 py-1 action-cell">
                <v-btn
                  v-if="timeSlotIndex === scheduleCopy[+day].timeSlots.length - 1"
                  icon
                  :data-test="`add-time-slot_${day}_${timeSlotIndex}`"
                  :aria-label="$t('common.add')"
                  @click="addSlot(+day)">
                  <v-icon size="24" color="grey darken-2">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td>
                <div :data-test="`appointments-availability-hours_day_${day}_no_slots`">
                  {{ $t(`enums.DayOfWeek.${DayOfWeek[+day]}`) }}
                </div>
              </td>
              <td>
                {{ $t('common.N/A') }}
              </td>
              <td />
              <td />
              <td class="px-0 py-1 action-cell">
                <v-btn icon data-test="delete-link" :aria-label="$t('common.delete')" @click="addSlot(+day)">
                  <v-icon size="24" color="grey darken-2">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { MessageBox, VSelectA11y } from '@libs/component-lib/components';
import { DayOfWeek, IDaySchedule, ITimeSlot } from '@libs/entities-lib/appointment';
import appointmentHelpers from '../utils/appointmentHelpers';

const INTERVALS = appointmentHelpers.createDropdownTimeIntervals('00:00', '24:00');

export default Vue.extend({
  name: 'AvailabilityHours',

  components: {
    VSelectA11y,
    MessageBox,
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
      showError: false,
      scheduleCopy: _cloneDeep(this.schedule),
    };
  },

  watch: {
    scheduleCopy: {
      handler(newData) {
        this.checkForErrors();
        this.$emit('update:schedule', newData);
        this.$emit('update:scheduleHasError', this.showError);
      },
      deep: true,
    },
  },

  methods: {
    // change the UTC datetime of the time slot with the new value , calculated from the new selected time
    updateTime(value: string, dayOfWeek: number, timeSlotIndex: number, position: string) {
      let updatedSlot = this.scheduleCopy[dayOfWeek].timeSlots[timeSlotIndex];
      if (updatedSlot) {
        updatedSlot = {
          ...updatedSlot,
          [position]: value,
        };

        const date = this.scheduleCopy[dayOfWeek]?.date;
        if (date) {
          const newTime = new Date(`${date} ${value}`).toISOString();
          updatedSlot[`${position}DateTime` as 'startDateTime' | 'endDateTime'] = newTime;
        }
      }
      this.scheduleCopy[dayOfWeek].timeSlots.splice(timeSlotIndex, 1, updatedSlot);
    },

    addSlot(day: number) {
      const slotDate = this.scheduleCopy[day].date;
      const daySlots = this.scheduleCopy[day].timeSlots;
      // Take over the end time of the previous slot as the start of the current slot, if there is a previous slot
      const startTime = daySlots.length ? daySlots[daySlots.length - 1].end : '09:00:00';

      const newSlot:ITimeSlot = {
        start: startTime,
        end: '17:00:00',
      };

      if (slotDate) {
        newSlot.startDateTime = new Date(`${slotDate} ${startTime}`).toISOString();
        newSlot.endDateTime = new Date(`${slotDate} 17:00`).toISOString();
      }

      this.scheduleCopy[day].timeSlots.push(newSlot);
    },

    deleteSlot(day: number, index: number) {
      this.scheduleCopy[day].timeSlots.splice(index, 1);
    },

    checkForErrors() {
     const hasError = Object.keys(this.scheduleCopy).some((key) => {
        const { timeSlots } = this.scheduleCopy[+key];
        const slotHasErrors = timeSlots.some((slot, index) => {
          if (slot.end <= slot.start || (!!timeSlots[index + 1] && slot.end > timeSlots[index + 1].start)) {
            return true;
          }
          return false;
        });
        return slotHasErrors;
      });
      this.showError = hasError;
    },
  },

});
</script>

<style lang="scss" scoped>
  .select {
    max-width: 130px;
  }
  .select-cell {
    width: 170px;
  }
  .action-cell {
    width: 50px;
  }

  ::v-deep .v-data-table > .v-data-table__wrapper > table {
    border-collapse: collapse;
  }

  ::v-deep .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    border-top: thin solid rgba(0, 0, 0, 0.12);
  }

</style>
