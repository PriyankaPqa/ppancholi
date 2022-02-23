<template>
  <div class="pa-4">
    <financial-assistance-tables-table />
  </div>
</template>

<script>
import FinancialAssistanceTablesTable from '@/ui/views/pages/financial-assistance/FinancialAssistanceTablesTable.vue';

export default {
  name: 'EventFinancialAssistanceHome',
  components: {
    FinancialAssistanceTablesTable,
  },
};
</script>
