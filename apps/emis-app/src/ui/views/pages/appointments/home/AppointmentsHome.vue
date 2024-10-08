<template>
  <rc-page-content
    content-padding="2"
    title="Appointments">
    <rc-tabs class="mt-4 mb-0">
      <rc-tab
        v-for="tab in tabs"
        :key="tab"
        :label="tab"
        :active="selectedTab === tab"
        @click="selectedTab = tab" />
    </rc-tabs>

    <staff-availability v-if="selectedTab === 'Schedule'" />
    <staff-calendar v-if="selectedTab === 'Calendar'" />
    <appointment-form v-if="selectedTab === 'Form'" :appointment="mockAppointment()" :is-edit-mode="false" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { mockAppointment } from '@libs/entities-lib/appointment';

import StaffAvailability from './StaffAvailability.vue';
import StaffCalendar from './StaffCalendar.vue';
import AppointmentForm from './AppointmentFormPOC.vue';

export default Vue.extend({
  name: 'AppointmentsHome',
  components: {
    StaffAvailability,
    StaffCalendar,
    AppointmentForm,
  },
  data: () => ({
    tabs: ['Calendar', 'Schedule', 'Form'],
    selectedTab: 'Form',
    mockAppointment,
  }),

});
</script>
