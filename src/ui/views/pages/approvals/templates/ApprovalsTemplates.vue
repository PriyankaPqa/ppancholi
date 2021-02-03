<template>
  <div class="pa-4">
    <approvals-table />
  </div>
</template>

<script>
import ApprovalsTable from '@/ui/views/pages/approvals/ApprovalsTable.vue';

export default {
  name: 'TeamsHome',
  components: {
    ApprovalsTable,
  },
};
</script>
