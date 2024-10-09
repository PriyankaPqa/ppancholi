<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex flex-column">
        <span class="rc-body14"> {{ $t('caseFile.appointments.attendee') }}</span>
        <span class="fw-bold rc-heading-5">{{ appointmentHelpers.getAttendeeName(attendee, primaryMemberId, this) }}</span>
      </div>
      <div>
        <status-chip
          data-test="appointment-details-status"
          status-name="AppointmentStatus"
          :status="appointment.appointmentStatus" />
      </div>
    </div>

    <div class="grid pt-4 px-4" :style="{ gridTemplateColumns: appointment.sendConfirmationEmail ? '1fr 1fr 1fr' : '1fr 1fr' }">
      <div class="date pr-4 mb-4 d-flex flex-column">
        <div class="rc-body14 d-flex align-center">
          <v-icon size="20" class="pr-1" color="var(--v-grey-darken3)">
            mdi-calendar-blank
          </v-icon>
          {{ $t('caseFile.appointments.date') }}
        </div>
        <div class="fw-bold pt-1">
          {{ format(new Date(appointment.startDate), 'PPPP') }}
        </div>
      </div>
      <div class="time px-4 mb-4 d-flex flex-column">
        <div class="rc-body14 d-flex align-center">
          <v-icon size="20" class="pr-1" color="var(--v-grey-darken3)">
            mdi-clock-outline
          </v-icon>
          {{ $t('caseFile.appointments.timeDuration') }}
        </div>
        <div class="pt-1 d-flex flex-column">
          <span class="fw-bold pb-1">{{ time }}</span>
          <span class="rc-body12"> {{ timeZone }}</span>
        </div>
      </div>
      <div v-if="appointment.sendConfirmationEmail" class="link pl-4 mb-4">
        <div class="rc-body14 d-flex align-center">
          <v-icon size="20" class="pr-1" color="var(--v-grey-darken3)">
            mdi-microsoft-teams
          </v-icon>
          {{ $t('caseFile.appointments.details.teamsLink') }}
        </div>
        <div class="pt-1">
          {{ isDetailsPage ? appointment.onlineMeetingUrl : '—' }}
        </div>
      </div>
      <div v-if="appointment.seriesMasterId" class="recurring py-4">
        Recurring
      </div>
    </div>

    <v-sheet rounded outlined class="mt-4">
      <v-simple-table>
        <tbody>
          <tr>
            <th>{{ $t('caseFile.appointments.setMeetingFor') }} </th>
            <td>{{ staffMemberNameRole }}</td>
          </tr>
          <tr>
            <th>{{ $t('caseFile.appointments.modality') }}</th>
            <td>{{ modalityName }}</td>
          </tr>
          <tr>
            <th>{{ $t('caseFile.appointments.appointmentProgram') }}</th>
            <td>{{ appointmentProgramName }}</td>
          </tr>
          <tr>
            <th>{{ $t('caseFile.appointments.serviceOption') }}</th>
            <td>{{ staffMemberNameRole }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-sheet>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { format } from 'date-fns';
import { IAppointment } from '@libs/entities-lib/appointment';
import { IMember } from '@libs/entities-lib/household-create';
import { TranslateResult } from 'vue-i18n';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import appointmentHelpers from '../utils/appointmentHelpers';

export default Vue.extend({
  name: 'AppointmentDetailsContent',

  components: {
    StatusChip,
  },

  props: {
    appointment: {
      type: Object as ()=> IAppointment,
      required: true,
    },
    attendee: {
      type: Object as ()=> IMember,
      required: true,
    },
    primaryMemberId: {
      type: String,
      required: true,
    },
    isDetailsPage: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      format,
      appointmentHelpers,
    };
  },

  computed: {

    time(): string {
      const duration = (new Date(this.appointment.endDate).getTime() - new Date(this.appointment.startDate).getTime()) / (1000 * 60);
      return `${format(new Date(this.appointment.startDate), 'p')} (${this.$t('caseFile.appointments.duration.minutes', { minutes: duration })})`;
    },

    timeZone(): TranslateResult {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().toLocaleDateString(this.$i18n.locale, { timeZoneName: 'longOffset', timeZone: userTimeZone })
      .substring(11).replace('GMT', 'UTC');
      const timeZoneName = new Date().toLocaleDateString(this.$i18n.locale, { timeZoneName: 'longGeneric', timeZone: userTimeZone }).substring(10);

      return `(${offset}) ${timeZoneName}`;
    },

    staffMemberNameRole(): TranslateResult {
      return appointmentHelpers.getStaffMemberName(this.appointment.userAccountId, '', this);
    },

    modalityName(): string {
      const modalities = useAppointmentProgramStore().getAppointmentModalities(this.appointment?.appointmentModalityId);
      return this.$m(modalities.find((m) => m.id === this.appointment?.appointmentModalityId)?.name);
    },

    appointmentProgramName(): string {
      return this.$m(useAppointmentProgramStore().getById(this.appointment.appointmentProgramId)?.name);
    },
  },

});

</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  // grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
  "date time link"
  "recurring recurring recurring";
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
}

.date {
  grid-area: date;
  border-right: thin solid var(--v-grey-lighten2);
}

.time {
  grid-area: time;
}

.link {
  grid-area: link;
  border-left: thin solid var(--v-grey-lighten2);
}

.recurring {
  grid-area: recurring;
  border-top: thin solid var(--v-grey-lighten2);
}

::v-deep .v-data-table__wrapper table tbody tr th {
  font-size: 14px;
  width: 30%;
}

</style>
