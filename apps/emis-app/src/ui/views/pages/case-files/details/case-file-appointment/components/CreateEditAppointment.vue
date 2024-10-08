<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="loading" :show-left-menu="false">
      <rc-page-content
        outer-scroll
        :title="isEditMode ? $t('caseFile.appointments.edit.title') : $t('caseFile.appointments.add.title')">
        <appointment-form
          :appointment.sync="appointment"
          :is-edit-mode="isEditMode"
          :event-id="caseFile.eventId"
          :primary-member-id="primaryMember ? primaryMember.id : ''"
          :primary-member-email="primaryMember ? primaryMember.contactInformation.email : ''"
          :attendees="members"
          :show-time-slot-error.sync="showTimeSlotError" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            data-test="save"
            :loading="loading"
            :disabled="failed || loading || (isEditMode && !dirty) "
            @click="submit()">
            {{ isEditMode ? $t('common.save') : $t('common.buttons.add') }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import {
  RcPageContent,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Appointment, IAppointment } from '@libs/entities-lib/appointment';
import routes from '@/constants/routes';
import { useAppointmentStore } from '@/pinia/appointment/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import caseFileDetail from '../../caseFileDetail';
import AppointmentForm from './AppointmentForm.vue';

export default mixins(caseFileDetail).extend({
  name: 'CreateEditAppointment',

  components: {
    VSelectWithValidation,
    AppointmentForm,
    PageTemplate,
    RcPageContent,
  },

  props: {
    id: {
      type: String,
      default: '',
    },
    appointmentId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      appointment: null as IAppointment,
      loading: false,
      showTimeSlotError: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.appointments.edit.name;
    },
  },

  watch: {
    'appointment.startDate': {
      async handler(newValue) {
        if (newValue) {
         this.showTimeSlotError = false;
        }
      },
    },
  },

  async created() {
    this.loading = true;
    await Promise.all([
      useAppointmentProgramStore().fetchByEventId(this.caseFile.eventId),
      useAppointmentProgramStore().fetchAppointmentModalities(),
      useAppointmentProgramStore().fetchServiceOptionTypes(),
    ]);

    if (this.isEditMode) {
      const res = await useAppointmentStore().fetch(this.appointmentId);
      this.appointment = new Appointment(res);
    } else {
      this.appointment = new Appointment();
      this.appointment.caseFileId = this.id;
    }
    this.loading = false;
  },

  methods: {
    back(): void {
      this.$router.replace({
        name: routes.caseFile.appointments.home.name,
      });
    },

   async submit() {
     this.showTimeSlotError = !this.appointment.startDate;
    const isValid = await (this.$refs.form as VForm).validate();

    if (!isValid || this.showTimeSlotError) {
      await this.$nextTick();
      helpers.scrollToFirstError('app');
    }

      // call endpoint to submit
    },
  },
});
</script>
