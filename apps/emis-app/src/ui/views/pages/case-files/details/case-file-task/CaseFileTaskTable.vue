<template>
  <tasks-table :id="id" is-in-case-file />
</template>

<script lang="ts">

import Vue from 'vue';
import TasksTable from '@/ui/views/pages/case-files/details/case-file-task/TasksTable.vue';

export default Vue.extend({
  name: 'CaseFileTaskTable',

  components: {
    TasksTable,
  },

  props: {
    // case file id
    id: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>

</style>
