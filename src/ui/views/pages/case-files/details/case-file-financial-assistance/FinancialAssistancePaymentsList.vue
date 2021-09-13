<template>
  <div class="pa-4">
    <rc-data-table
      class="financialAssistanceOverview__table"
      :items="tableData"
      :count="count"
      :headers="headers"
      :labels="labels"
      :table-props="tableProps"
      :show-add-button="canAdd"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      @search="search"
      @add-button="routeToCreate">
      <!-- :response="response" -->
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.CaseFileFinancialAssistanceOverview"
          :filter-options="filters"
          :count="count"
          @update:appliedFilter="onApplyFilter">
          <template #toolbarActions>
            <v-btn height="32" color="primary" style="color: white" data-test="financialAssistanceOverview__statsButton">
              {{ $t('caseFile.financialAssistance.statsButton') }}
            </v-btn>
          </template>
        </filter-toolbar>
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`fap_link_${item.entity.id}`"
          :to="getFapDetailsRoute(item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.created}`]="{ item }">
        <span data-test="fap_created"> {{ getStringDate(item.entity.created, 'll') }}</span>
      </template>

      <template #[`item.${customColumns.totals}`]="{ item }">
        <div data-test="fap_total" class="amount">
          {{ $formatCurrency(item.metadata.total) }}
        </div>
      </template>

      <template #[`item.${customColumns.approvalStatus}`]="{ item }">
        <status-chip status-name="FinancialAssistancePaymentStatus" :status="item.entity.approvalStatus" />
      </template>

      <template #[`item.edit`]="{ item }">
        <v-btn v-if="isModifiable(item)" icon data-test="edit-link" :to="getFapEditRoute(item.entity.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.delete`]="{ item }">
        <v-btn v-if="isModifiable(item)" icon data-test="delete-link" @click="deletePayment(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
  IFilterSettings,
} from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { FilterKey } from '@/entities/user-account';
import { IAzureSearchParams } from '@/types';
import helpers from '@/ui/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { ApprovalStatus, IFinancialAssistancePaymentCombined } from '@/entities/financial-assistance-payment';

export default Vue.extend({
  name: 'FinancialAssistancePaymentsList',

  components: {
    RcDataTable,
    FilterToolbar,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  data() {
    return {
      FilterKey,
      searchResultIds: [] as string[],
      count: 0,
      options: {
        sortBy: ['Entity/Name'],
        sortDesc: [false],
      },
      tableProps: {
        loading: false,
      },
      getStringDate: helpers.getStringDate,
    };
  },

  computed: {

    tableData(): IFinancialAssistancePaymentCombined[] {
      return this.$storage.financialAssistancePayment.getters.getByIds(this.searchResultIds, true);
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        created: 'Entity/Created',
        totals: 'Metadata/Total',
        approvalStatus: `Metadata/ApprovalStatusName/Translation/${this.$i18n.locale}`,
        edit: 'edit',
        delete: 'delete',
      };
    },

    headers(): Array<DataTableHeader> {
      const headers = [{
        text: this.$t('caseFilesTable.tableHeaders.name') as string,
        value: this.customColumns.name,
        sortable: true,
      }, {
        text: this.$t('caseFilesTable.filters.createdDate') as string,
        value: this.customColumns.created,
        sortable: true,
      }, {
        text: this.$t('caseFile.financialAssistance.totals') as string,
        value: this.customColumns.totals,
        sortable: true,
        align: 'center',
      }, {
        text: this.$t('caseFile.financialAssistance.approvalStatus') as string,
        value: this.customColumns.approvalStatus,
        sortable: true,
        width: 200,
      }] as Array<DataTableHeader>;

      if (this.canEdit) {
        headers.push({
          text: '',
          sortable: false,
          value: this.customColumns.edit,
          width: '5%',
        });
      }

      if (this.canDelete) {
        headers.push({
          text: '',
          sortable: false,
          value: this.customColumns.delete,
          width: '5%',
        });
      }

      return headers;
    },

    /* These filters will work but for now that's been scratched out of jira
      - approvalStatus is not filterable yet on backend either */
    filters(): Array<IFilterSettings> {
      return [];
      //   key: 'Entity/Name',
      //   type: EFilterType.Text,
      //   label: this.$t('common.name') as string,
      // },
      // {
      //   key: 'Entity/ApprovalStatus',
      //   type: EFilterType.Select,
      //   label: this.$t('caseFile.financialAssistance.approvalStatus') as string,
      //   items: helpers.enumToTranslatedCollection(ApprovalStatus, 'enums.transactionApprovalStatus'),
      // },
    },

    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('caseFile.financialAssistance.overview', { count: this.count }),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    canAdd(): boolean {
      return this.$hasLevel('level1');
    },

    canEdit(): boolean {
      return this.$hasLevel('level1');
    },

    canDelete(): boolean {
      return this.$hasLevel('level1');
    },
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await this.$storage.financialAssistancePayment.actions.search({
        search: params.search,
        filter: { 'Entity/CaseFileId': this.$route.params.id, ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      this.searchResultIds = res.ids;
      this.count = res.count;
      return { value: this.$storage.financialAssistancePayment.getters.getByIds(res.ids), odataCount: res.count };
    },

    isModifiable(item: IFinancialAssistancePaymentCombined) {
      return item.entity.approvalStatus === ApprovalStatus.New;
    },

    routeToCreate() {
      this.$router.push({
        name: routes.caseFile.financialAssistance.create.name,
      });
    },

    getFapDetailsRoute(id: string) {
      return {
        name: routes.caseFile.financialAssistance.details.name,
        params: {
          financialAssistancePaymentId: id,
        },
      };
    },

    getFapEditRoute(id: string) {
      return {
        name: routes.caseFile.financialAssistance.edit.name,
        params: {
          financialAssistancePaymentId: id,
        },
      };
    },

    async deletePayment(item: IFinancialAssistancePaymentCombined) {
      const doDelete = await this.$confirm(this.$t('caseFile.financialAssistance.confirm.delete.title'),
        this.$t('caseFile.financialAssistance.confirm.delete.message'));
      if (doDelete) {
        await this.$storage.financialAssistancePayment.actions.deactivate(item.entity.id);
      }
    },
  },
});
</script>

<style scoped>
.amount {
  font-weight: bold;
  text-align: right;
  min-width: 80px;
  display: inline-block;
}
</style>
