<template>
  <div class="pa-4">
    <financial-assistance-templates-table />
  </div>
</template>

<script>
import FinancialAssistanceTemplatesTable from '@/ui/views/pages/financial-assistance/FinancialAssistanceTemplatesTable.vue';

export default {
  name: 'EventFinancialAssistanceHome',
  components: {
    FinancialAssistanceTemplatesTable,
  },
};
</script>
