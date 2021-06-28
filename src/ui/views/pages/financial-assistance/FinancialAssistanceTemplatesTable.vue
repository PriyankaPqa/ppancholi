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
    show-help
    @search="search">
    <template v-if="$hasLevel('level6')" #headerLeft>
      <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="onClickMenuItem($event)" />
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDataTable, RcAddButtonWithMenu } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'FinancialAssistanceTemplatesTable',
  components: {
    RcDataTable,
    RcAddButtonWithMenu,
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
          title: this.$t('financialAssistance.table.title.table'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    menuItems(): Array<Record<string, string>> {
      return [
        {
          text: this.$t('financialAssistance.createNewTable') as string,
          value: 'new',
          icon: 'mdi-file',
          dataTest: 'financialAssistanceTables__createNew',
        },
        // {
        //   text: this.$t('financialAssistance.createTableFromExisting') as string,
        //   value: 'copy',
        //   icon: 'mdi-file-multiple',
        //   dataTest: 'financialAssistanceTables__copyExisting',
        // },
      ];
    },
  },
  methods: {
    search() {
      return false;
    },

    onClickMenuItem(item: Record<string, string>) {
      if (item.value === 'new') {
        this.$router.push({
          name: routes.events.financialAssistance.create.name,
        });
      }
    },
  },
});
</script>
