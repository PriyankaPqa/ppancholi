<template>
  <tasks-table :id="id" :case-file="caseFile" is-in-case-file />
</template>

<script lang="ts">

import TasksTable from '@/ui/views/pages/case-files/details/case-file-task/TasksTable.vue';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileTaskTable',

  components: {
    TasksTable,
  },
});
</script>

<style scoped>

</style>
