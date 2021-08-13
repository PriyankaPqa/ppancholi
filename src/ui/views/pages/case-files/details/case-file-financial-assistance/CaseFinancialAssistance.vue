<template>
  <div class="pa-4">
    <rc-data-table
      class="financialAssistanceOverview__table"
      :items="items"
      :count="count"
      :headers="headers"
      :labels="labels"
      :table-props="tableProps"
      sort-by="approvalStatus"
      :sort-desc="true"
      show-help
      :show-add-button="true"
      :custom-columns="['name', 'totals', 'groupStatus', 'statusHistory', 'approvalStatus']"
      @search="search"
      @add-button="routeToCreate">
      <template #filter>
        <filter-toolbar
          filter-key="caseFileFinancialAssistanceOverview"
          :filter-options="filters"
          :response="response"
          :count="count"
          @update:appliedFilter="filter">
          <template slot="toolbarActions">
            <v-btn
              v-if="canSubmitPaymentRequest"
              height="32"
              color="primary"
              data-test="financialAssistanceOverview__submitButton"
              @click="showApprovalDialog = true">
              {{ $t('caseFile.financialAssistance.submitButton') }}
            </v-btn>

            <v-btn height="32" color="primary" data-test="financialAssistanceOverview__statsButton">
              {{ $t('caseFile.financialAssistance.statsButton') }}
            </v-btn>
          </template>
        </filter-toolbar>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
  ISearchData,
} from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import { ITransaction } from '@/entities/case-file';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'TransactionsList',

  components: {
    RcDataTable,
    FilterToolbar,
  },

  data() {
    return {
      searchParams: {} as ISearchData,

      filterParams: [] as Array<string>,

      items: [] as Array<ITransaction>,

      showApprovalDialog: false,

      showHistoryDialog: false,

      historyTransaction: null,

      count: 0,

      tableProps: {
        loading: false,
      },
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [{
        text: this.$t('caseFilesTable.tableHeaders.name') as string,
        value: 'name',
        sortable: true,
      }, {
        text: this.$t('caseFilesTable.filters.createdDate') as string,
        value: 'createdDate',
        sortable: false,
      }, {
        text: this.$t('caseFile.financialAssistance.totals') as string,
        value: 'totals',
        sortable: false,
      }, {
        text: this.$t('caseFile.financialAssistance.approvalStatus') as string,
        value: 'approvalStatus',
        sortable: true,
        width: 200,
      }];
    },

    // filters(): Array<IFilterSettings> {
    //   return [{
    //     key: 'name',
    //     type: EFilterType.Text,
    //     label: this.$t('common.name') as string,
    //   }, {
    //     key: 'approvalStatus',
    //     type: EFilterType.Select,
    //     label: this.$t('caseFile.financialAssistance.approvalStatus') as string,
    //     items: helpers.enumToTranslatedCollection(ETransactionApprovalStatus, 'enums.transactionApprovalStatus'),
    //   }];
    // },

    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('caseFile.financialAssistance.overview', { count: this.count }),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    // caseFileIsOpen(): boolean {
    //   return this.$store.getters['caseFileModule/caseFileIsOpen'];
    // },

    // canCreateTransaction(): boolean {
    //   return this.$can('CreateTransaction') && this.caseFileIsOpen;
    // },

    // canSubmitPaymentRequest():boolean {
    //   return this.$can('SubmitPaymentRequest') && this.caseFileIsOpen;
    // },
  },

  methods: {
    routeToCreate() {
      this.$router.push({
        name: routes.caseFile.financialAssistance.create.name,
      });
    },
  },
});
</script>

<style scoped>

</style>
