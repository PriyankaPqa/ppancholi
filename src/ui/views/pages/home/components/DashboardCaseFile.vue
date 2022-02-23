<template>
  <div class="pa-4">
    <case-file-table />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';

export default Vue.extend({
  name: 'HomeLevel1',
  components: {
    CaseFileTable,
  },
});
</script>
