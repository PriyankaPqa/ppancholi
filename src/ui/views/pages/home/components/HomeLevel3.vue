<template>
  <div class="pa-4">
    <v-row no-gutters>
      <v-col cols="12" sm="8" md="6" lg="8">
        <v-row no-gutters class="full-height mr-4">
          <v-col cols="12" class="mb-4">
            <case-files-table :limit-results="3" hide-footer />
          </v-col>
          <v-col cols="12">
            <teams-table :title="'common.myTeams'" :limit-results="3" hide-footer />
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
import CaseFilesTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';
import TeamStats from '@/ui/views/pages/home/components/stats/TeamStats.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';

export default Vue.extend({
  name: 'HomeLevel3',
  components: {
    CaseFilesTable,
    TeamsTable,
    TeamStats,
    EventStats,
  },
});
</script>
