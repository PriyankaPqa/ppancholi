<template>
  <rc-dialog
    :title="$t('massAction.financialAssistance.table.add.list')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.next')"
    :submit-button-disabled="true"
    :persistent="true"
    fullscreen
    content-padding="0"
    @cancel="onCancel()"
    @close="onClose()"
    @submit="onSubmit()">
    <rc-data-table
      class="massAction__caseFile_table"
      hide-header
      :hide-footer="itemsCount === 0"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :headers="headers"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      @search="search">
      <template #no-data>
        <div class="no-data">
          <i18n path="massAction.use.filter" tag="div" for="edit">
            <v-icon>
              mdi-filter-variant
            </v-icon>
          </i18n>
        </div>
      </template>
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.CaseFiles"
          :count="itemsCount"
          :filter-options="filters"
          @update:appliedFilter="onApplyFilter">
          <template #toolbarActions>
            <v-btn class="export" color="primary" :disabled="!filtersOn" @click="onExport()">
              {{ $t('massAction.common.export') }}
            </v-btn>
          </template>
        </filter-toolbar>
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">

import { RcDialog, RcDataTable, IFilterSettings } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import _isEmpty from 'lodash/isEmpty';
import mixins from 'vue-typed-mixins';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@/types';
import { IAzureTableSearchResults } from '@/types/interfaces/IAzureSearchResult';
import { IMassActionCombined } from '@/entities/mass-action';
import { FilterKey } from '@/entities/user-account';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'FinancialAssistanceCreateByList',

  components: {
    RcDialog,
    RcDataTable,
    FilterToolbar,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      title: 'test',
      itemsCount: 0,
      searchResultIds: [],
      FilterKey,
    };
  },

  computed: {
    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.caseFileEntities.searchLoading,
        'no-data-text': 'Please use the filter to select case files for processing',
      };
    },

    customColumns(): Record<string, string> {
      return {
        'no-data': 'Entity/Name',
      };
    },

    tableData(): IMassActionCombined[] {
      return this.$storage.caseFile.getters.getByIds(this.searchResultIds, true);
    },

    headers(): Array<DataTableHeader> {
      return [];
    },

    filters(): Array<IFilterSettings> {
      return [

      ];
    },

    filtersOn(): boolean {
      return !_isEmpty(this.userFilters);
    },
  },

  methods: {
    onCancel() {
      this.$emit('update:show', false);
    },

    onClose() {
      this.$emit('update:show', false);
    },

    onSubmit() {
      this.$emit('update:show', false);
    },

    onExport() {
      return false;
    },

    async fetchData(params: IAzureSearchParams) {
      if (this.filtersOn) {
        const res = await this.$storage.caseFile.actions.search({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
        this.setResults(res);
        return res;
      }
      return [];
    },

    setResults(res: IAzureTableSearchResults) {
      this.itemsCount = res.count;
      this.searchResultIds = res.ids;
    },
  },
});
</script>

<style lang="scss" >
 .massAction__caseFile_table {
   .export {
     color: white !important;
   }

   .no-data {
     color: #656565 !important;
     font-weight: bold;
   }
 }
</style>
