<template>
  <div class="pa-4">
    Appointments
    <staff-availability />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StaffAvailability from './StaffAvailability.vue';

export default Vue.extend({
  name: 'AppointmentsHome',
  components: {
    StaffAvailability,
  },
  data: () => ({

  }),

});
</script>
