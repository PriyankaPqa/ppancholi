<template>
  <div class="full-height">
    <rc-page-loading v-if="loading" />
    <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
      <rc-page-content
        v-if="!loading"
        outer-scroll
        :title="isEditMode ? $t('caseFile.appointments.edit.title') : $t('caseFile.appointments.add.title')">
        <appointment-form
          :appointment.sync="appointment"
          :is-edit-mode="isEditMode"
          :event-id="caseFile.eventId"
          :primary-member-id="primaryMember ? primaryMember.id : ''"
          :primary-member-email="primaryMember ? primaryMember.contactInformation.email : ''"
          :attendees="members" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || loading || (isEditMode && !dirty) " @click.stop="submit">
            {{ isEditMode ? $t('common.save') : $t('common.buttons.add') }}
          </v-btn>
        </template>
      </rc-page-content>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import {
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Appointment, IAppointment } from '@libs/entities-lib/appointment';
import routes from '@/constants/routes';
import { useAppointmentStore } from '@/pinia/appointment/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { APPOINTMENTS } from '@/ui/views/pages/appointments/home/mocks';
import caseFileDetail from '../../caseFileDetail';
import AppointmentForm from './AppointmentForm.vue';

export default mixins(caseFileDetail).extend({
  name: 'CreateEditAppointment',

  components: {
    VSelectWithValidation,
    AppointmentForm,
  },

  props: {
    appointmentId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      appointment: null as IAppointment,
      loading: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.appointments.edit.name;
    },
  },

  async created() {
    this.appointment = new Appointment(this.appointment || APPOINTMENTS[0]);
    this.loading = true;
    await Promise.all([
      useAppointmentProgramStore().fetchByEventId(this.caseFile.eventId),
      useAppointmentProgramStore().fetchAppointmentModalities(),
      useAppointmentProgramStore().fetchServiceOptionTypes(),
    ]);

    if (this.isEditMode) {
      const res = await useAppointmentStore().fetch(this.appointmentId);
      this.appointment = new Appointment(res);
    }
    this.loading = false;
  },

  methods: {
    back(): void {
      this.$router.replace({
        name: routes.caseFile.appointments.home.name,
      });
    },

    submit() {
      return null;
    },
  },
});
</script>
