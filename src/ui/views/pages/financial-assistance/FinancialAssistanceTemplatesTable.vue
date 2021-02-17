<template>
  <rc-data-table
    data-test="fa-templates-table"
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
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'FinancialAssistanceTemplatesTable',
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
    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('financialAssistance.table.title'),
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
