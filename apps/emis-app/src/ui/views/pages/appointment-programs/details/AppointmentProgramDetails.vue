<template>
  <rc-page-content :title="$t('appointmentProgram.details.title')">
    <rc-page-loading v-if="loading" />
    <v-row v-else-if="appointmentProgram" class="justify-center py-6">
      <v-col cols="12" lg="8">
        <div class="pb-4 d-flex justify-space-between">
          <div class="details-page-title" data-test="appointmentProgram_details_name">
            {{ $m(appointmentProgram.name) }}
          </div>

          <div class="d-flex flex-nowrap align-start">
            <status-chip class="mt-1 mr-2" data-test="appointmentProgram_details_status" status-name="Status" :status="appointmentProgram.appointmentProgramStatus" />
            <v-btn icon :aria-label="$t('common.edit')" data-test="edit-appointment-program" :to="editRoute">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn icon data-test="delete-appointment-program" :aria-label="$t('common.delete')" @click="deleteAppointmentProgram">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>

        <div
          v-if="appointmentProgram.appointmentProgramStatusHistory && appointmentProgram.appointmentProgramStatusHistory.rationale"
          class="status-history border-radius-all d-flex flex-column pa-4 mb-8 rc-body14"
          data-test="appointmentProgram_details_statusHistory">
          <div data-test="appointmentProgram_details_statusHistory_user">
            {{ statusHistoryText }}
          </div>
          <div data-test="appointmentProgram_details_statusHistory_rationale">
            {{ appointmentProgram.appointmentProgramStatusHistory.rationale }}
          </div>
        </div>

        <v-sheet rounded outlined class="mb-2">
          <v-simple-table data-test="appointmentProgram_details_timeZone">
            <tbody>
              <tr>
                <td> <span class="fw-bold">{{ $t('appointmentProgram.timeZone') }} </span> </td>
                <td> {{ timeZone ? $t(`appointmentProgram.timeZones.${timeZone.label}`, { offset: timeZone.offset }) : '' }}  </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
        <div class="fw-bold pt-8 pb-4">
          {{ $t('appointmentProgram.section.businessHours') }}
        </div>
        <availability-hours :schedule.sync="schedule" :is-edit-mode="false" />

        <div class="fw-bold py-4">
          {{ $t('appointmentProgram.section.serviceOptions') }}
        </div>
        <service-options-table
          :appointment-program-id="appointmentProgram.id"
          :service-options.sync="appointmentProgram.serviceOptions"
          is-edit-mode />

        <div class="fw-bold py-4">
          {{ $t('appointmentProgram.section.staffMembers') }}
        </div>
        <staff-members-table
          :appointment-program-id="appointmentProgram.id"
          is-edit-mode
          :event-id="id"
          :service-options="appointmentProgram.serviceOptions" />
      </v-col>
    </v-row>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAppointmentProgram, DayOfWeek, IDaySchedule } from '@libs/entities-lib/appointment';
import { canadaTimeZones } from '@/constants/canadaTimeZones';
import { format, parseISO } from 'date-fns';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';
import { TranslateResult } from 'vue-i18n';
import AvailabilityHours from '../../appointments/components/AvailabilityHours.vue';
import ServiceOptionsTable from '../components/ServiceOptionsTable.vue';
import StaffMembersTable from '../components/StaffMembersTable.vue';

export default Vue.extend({
  name: 'AppointmentProgramDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcPageLoading,
    AvailabilityHours,
    ServiceOptionsTable,
    StaffMembersTable,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
    appointmentProgramId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      helpers,
      DayOfWeek,
      showServiceOptionDialog: false,
      loading: false,
    };
  },

 computed: {
    appointmentProgram(): IAppointmentProgram {
      return useAppointmentProgramStore().getById(this.appointmentProgramId);
    },

    timeZone(): { label: string, offset: string } {
        return canadaTimeZones.find((z) => z.name === this.appointmentProgram.timeZone);
    },

    schedule(): Record<number, IDaySchedule> {
      const weekSchedule = {} as Record<number, IDaySchedule>;
        (helpers.getEnumValues(DayOfWeek) as number[]).forEach((weekDay) => {
          weekSchedule[weekDay] = this.appointmentProgram.businessHours.find((s) => s.day === weekDay) || { day: weekDay, timeSlots: [] };
        });
        return weekSchedule;
    },

    statusHistoryText(): string | TranslateResult {
      const data = this.appointmentProgram.appointmentProgramStatusHistory;
      if (data) {
        const name = data.userInformation?.userName || '';
        const role = this.$m(data.userInformation?.roleName);
        const date = format(parseISO(data.dateOfAction as string), 'PP');
        return this.$t(`appointmentProgram.details.statusHistoryText.${this.appointmentProgram.appointmentProgramStatus}`, { name, role, date });
      }
      return '';
    },

    editRoute(): { name: string, params: { appointmentProgramId: string } } {
      return {
        name: routes.events.appointmentPrograms.edit.name,
        params: {
          appointmentProgramId: this.appointmentProgramId,
        },
      };
    },
 },

 async created() {
    this.loading = true;
    await useAppointmentProgramStore().fetch(this.appointmentProgramId);
    this.loading = false;
  },

  methods: {
   async deleteAppointmentProgram() {
      const userChoice = await this.$confirm({
        title: this.$t('appointmentPrograms.confirm.delete.title'),
        messages: this.$t('appointmentPrograms.confirm.delete.message'),
      });

      if (userChoice) {
        const res = await useAppointmentProgramStore().deleteAppointmentProgram(this.appointmentProgramId);
        if (res) {
          this.$toasted.global.success(this.$t('appointmentProgram.deleted'));
          this.$router.push({ name: routes.events.appointmentPrograms.home.name });
        } else {
          this.$toasted.global.error(this.$t('appointmentProgram.deleted.failed'));
        }
      }
    },
  },
});
</script>

<style scoped lang="scss">
.status-history{
  background-color: var(--v-status_yellow_pale-base);
}
</style>
