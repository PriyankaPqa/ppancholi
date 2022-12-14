<template>
  <div class="pa-4">
    <v-row no-gutters>
      <v-col cols="12" sm="8" md="6" lg="8">
        <v-row no-gutters class="full-height mr-4">
          <v-col cols="12">
            <case-file-table />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" sm="4" md="6" lg="4">
        <v-row no-gutters class="full-height">
          <v-col cols="12" class="mb-4">
            <event-stats />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';

export default {
  name: 'HomeContributorIM',

  components: {
    CaseFileTable,
    EventStats,
  },
};

</script>
