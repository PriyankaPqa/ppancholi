<template>
  <rc-page-content :title="$t('caseFile.appointments.details.title')">
    <rc-page-loading v-if="loading" />
    <v-row class="justify-center mt-6">
      <v-col cols="12" lg="8">
        Details
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="appointment-details-back"
        @click="navigateBack">
        {{ $t('caseFile.appointments.details.backToAppointments') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import routes from '@/constants/routes';
// import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'AppointmentDetails',

  components: {
    RcPageContent,
    // StatusChip,
    RcPageLoading,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
    serviceOptionId: {
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
      loading: false,
    };
  },

 computed: {

 },

 async created() {
    this.loading = true;
    await Promise.all([
      useAppointmentProgramStore().fetchAppointmentModalities(),
      useAppointmentProgramStore().fetchServiceOptionTypes(),
    ]);
    this.loading = false;
  },

  methods: {
    navigateBack() {
      this.$router.push({ name: routes.caseFile.appointments.home.name, params: { id: this.id } });
    },
  },
});
</script>
