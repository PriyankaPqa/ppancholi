<template>
  <div class="pa-4">
    <rc-data-table
      show-add-button
      data-test="approvals-table"
      :items="items"
      :count="count"
      :headers="[]"
      :labels="labels"
      sort-by="status"
      :sort-desc="true"
      @add-button="createTemplate()"
      @search="search" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDataTable } from '@libs/component-lib/components';

import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';

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
          title: this.$t('approval.template.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

  },

  methods: {
    search() {
      return false;
    },
    createTemplate() {
      this.$router.push({ name: routes.approvals.templates.create.name });
    },
  },

});
</script>
