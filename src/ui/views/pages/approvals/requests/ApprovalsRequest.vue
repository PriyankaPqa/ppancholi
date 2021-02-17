<template>
  <div class="pa-4">
    <rc-data-table
      data-test="approvals-request"
      :items="items"
      :count="count"
      :headers="[]"
      :labels="labels"
      sort-by="status"
      :sort-desc="true"
      @search="search" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDataTable } from '@crctech/component-library';

import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'ApprovalsTable',
  components: {
    RcDataTable,
  },
  data() {
    return {
      items: [],
      count: 0,
      tableProps: {
        loading: false,
      },
    };
  },

  computed: {
    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('dashboard.approval.requests.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

  },

  methods: {
    search() {
      return false;
    },
  },

});
</script>
