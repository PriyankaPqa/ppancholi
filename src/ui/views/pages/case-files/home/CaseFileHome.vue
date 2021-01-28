<template>
  <div class="pa-4">
    <case-file-table />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CaseFileTable from '@/ui/views/components/CaseFileTable.vue';

export default Vue.extend({
  name: 'CaseFileHome',
  components: {
    CaseFileTable,
  },
});
</script>
