<template>
  <rc-data-table
    data-test="teams-table"
    :items="items"
    :count="count"
    :labels="labels"
    :headers="[]"
    :sort-by="'name'"
    @search="search" />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcDataTable } from '@rctech/component-library';

export default Vue.extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
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
          title: this.$t('dashboard.teams.teams'),
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
