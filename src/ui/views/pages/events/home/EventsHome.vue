<template>
  <div class="pa-4">
    <events-table />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import EventsTable from '@/ui/views/pages/events/EventsTable.vue';

export default Vue.extend({
  name: 'EventsHome',
  components: {
    EventsTable,
  },
});
</script>
