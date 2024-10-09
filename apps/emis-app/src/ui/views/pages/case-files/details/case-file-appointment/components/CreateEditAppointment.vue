<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="loading" :show-left-menu="false">
      <rc-page-content
        outer-scroll
        :title="isEditMode ? $t('caseFile.appointments.edit.title') : $t('caseFile.appointments.add.title')">
        <appointment-form
          :appointment="appointment"
          :submit-request-data.sync="submitRequestData"
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
            :loading="loadingSubmit"
            :disabled="failed || loading || (isEditMode && !dirty) "
            @click="initSubmit()">
            {{ isEditMode ? $t('common.save') : $t('common.buttons.next') }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
    <rc-dialog
      v-if="showReview"
      :title="$t('caseFile.appointments.review.title')"
      :show.sync="showReview"
      :cancel-action-label="$t('caseFile.appointments.review.backToEdit')"
      :submit-action-label="$t('common.buttons.create')"
      :max-width="800"
      :min-height="400"
      content-padding="8"
      persistent
      data-test="appointment-review-dialog"
      @cancel="showReview = false"
      @close="showReview = false"
      @submit="showConfirmation">
      <appointment-details-content
        :appointment="submitRequestData"
        :attendee="attendee"
        :primary-member-id="primaryMember ? primaryMember.id : ''" />
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import {
  RcPageContent,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { Appointment, IAppointment, IAppointmentRequest } from '@libs/entities-lib/appointment';
import routes from '@/constants/routes';
import { useAppointmentStore } from '@/pinia/appointment/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { IMemberEntity } from '@libs/entities-lib/household-create';
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
      loadingSubmit: false,
      showTimeSlotError: false,
      showReview: false,
      submitRequestData: null as IAppointmentRequest,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.appointments.edit.name;
    },
    attendee(): IMemberEntity {
      if (!this.submitRequestData?.attendeeEmail) {
        return null;
      }
      return this.members.find((m) => this.submitRequestData.attendeeId === m.id);
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
      useAppointmentProgramStore().fetchAppointmentModalities(),
      useAppointmentProgramStore().fetchServiceOptionTypes(),
      this.fetchAppointmentPrograms(),
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

    async fetchAppointmentPrograms() {
      const programs = await useAppointmentProgramStore().fetchByEventId(this.caseFile.eventId);
      if (!programs?.length) {
        this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.appointments.error.noAppointmentPrograms') });
      }
    },

    async  showConfirmation() {
      this.showReview = false;
      const confirmCreate = await this.$confirm({
        title: this.$t('caseFile.appointments.confirmCreate.title'),
        messages: this.$t('caseFile.appointments.confirmCreate.content'),
      });
      if (confirmCreate) {
        await this.submit();
      }
    },

    async initSubmit() {
      if (!this.submitRequestData) {
        return;
      }

      this.showTimeSlotError = !this.submitRequestData.startDate;
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid || this.showTimeSlotError) {
        await this.$nextTick();
        helpers.scrollToFirstError('app');
        return;
      }

      if (this.isEditMode) {
        await this.submit();
      } else {
        this.showReview = true;
      }
    },

    async submit() {
      this.loadingSubmit = true;
     const appointment = !this.isEditMode ? await useAppointmentStore().createAppointment(
        {
          ...this.submitRequestData,
          preferredLanguage: { optionItemId: this.primaryMember.contactInformation.preferredLanguage.optionItemId, specifiedOther: null },
        },
      ) : null;
      if (appointment) {
        this.$toasted.global.success(this.$t(this.isEditMode ? 'caseFile.appointments.success.edit' : 'caseFile.appointments.success.create'));
        this.$router.push({ name: routes.caseFile.appointments.details.name, params: { id: this.id, appointmentId: appointment.id } });
      } else {
        this.$toasted.global.error(this.$t(this.isEditMode ? 'caseFile.appointments.failed.edit' : 'caseFile.appointments.failed.create'));
      }

      this.loadingSubmit = false;
    },
  },
});
</script>
