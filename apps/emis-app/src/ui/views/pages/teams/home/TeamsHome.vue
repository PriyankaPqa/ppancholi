<template>
  <div class="pa-4">
    <teams-table />
  </div>
</template>

<script>
import TeamsTable from '@/ui/views/pages/teams/TeamsTable.vue';

export default {
  name: 'TeamsHome',
  components: {
    TeamsTable,
  },
};
</script>
