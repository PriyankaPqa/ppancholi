<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      @add-button="goToAdd"
      @search="search" />
    <case-file-status-mass-action-filtering v-if="showProcessByList" :show.sync="showProcessByList" />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'CaseFileStatusMassActionHome',

});
</script>
