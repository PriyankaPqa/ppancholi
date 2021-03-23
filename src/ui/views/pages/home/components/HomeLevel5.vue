<template>
  <div class="pa-4">
    <v-row no-gutters>
      <v-col cols="12" sm="8" md="6" lg="8">
        <v-row no-gutters class="full-height mr-4">
          <v-col cols="12">
            <events-table is-dashboard />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" sm="4" md="6" lg="4">
        <v-row no-gutters class="full-height">
          <v-col cols="12" class="mb-4">
            <event-stats />
          </v-col>
          <v-col cols="12">
            <team-stats />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import EventsTable from '@/ui/views/pages/events/EventsTable.vue';
import EventStats from '@/ui/views/components/stats/EventStats.vue';
import TeamStats from '@/ui/views/components/stats/TeamStats.vue';

export default Vue.extend({
  name: 'HomeLevel5',
  components: {
    EventsTable,
    EventStats,
    TeamStats,
  },
});
</script>
