<template>
  <div>
    <rc-data-table
      data-test="teams-table"
      :items="items"
      :count="count"
      :labels="labels"
      :headers="[]"
      :sort-by="'name'"
      @search="search">
      <template #filter>
        <filter-toolbar
          filter-key="teams"
          :filter-options="filters"
          :count="count"
          @update:appliedFilter="onApplyFilter" />
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcDataTable, IFilterSettings } from '@crctech/component-library';

import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';

export default Vue.extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    FilterToolbar,
  },

  props: {
    title: {
      type: String,
      default: 'dashboard.teams.teams',
    },
  },

  data() {
    return {
      items: [],
      count: 0,
    };
  },

  computed: {
    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t(this.title),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },
    filters(): Array<IFilterSettings> {
      return [];
    },
  },

  methods: {
    search() {
      return false;
    },
    async onApplyFilter(filter: Array<string>) {
      return filter;
    },
  },
});
</script>
