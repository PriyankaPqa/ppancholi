<template>
  <rc-data-table
    ref="caseFilesTable"
    data-test="case-files-table"
    :items="items"
    :count="count"
    :labels="labels"
    :headers="[]"
    sort-by="createdDate"
    sort-desc
    :hide-footer="hideFooter"
    @search="search" />
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcDataTable,
} from '@crctech/component-library';

export default Vue.extend({
  name: 'CaseFilesTable',
  components: {
    RcDataTable,
  },
  props: {
    showFiltersBar: {
      type: Boolean,
      default: false,
    },
    limitResults: {
      type: Number,
      default: 0,
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      items: [],
      count: 0,
    };
  },
  computed: {
    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t('caseFiles_table.title')} (${this.count})`,
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
