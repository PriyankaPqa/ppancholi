<template>
  <rc-page-content
    content-padding="2"
    title="Appointments">
    <rc-tabs class="mt-4 mb-0">
      <rc-tab
        v-for="tab in tabs"
        :key="tab"
        :label="tab === 'schedule' ? 'Schedule' : 'Calendar'"
        :active="selectedTab === tab"
        @click="selectedTab = tab" />
    </rc-tabs>

    <staff-availability v-if="selectedTab === 'schedule'" />
    <staff-calendar v-if="selectedTab === 'calendar'" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import StaffAvailability from './StaffAvailability.vue';
import StaffCalendar from './StaffCalendar.vue';

export default Vue.extend({
  name: 'AppointmentsHome',
  components: {
    StaffAvailability,
    StaffCalendar,
  },
  data: () => ({
    tabs: ['calendar', 'schedule'],
      selectedTab: 'calendar',
  }),

});
</script>
