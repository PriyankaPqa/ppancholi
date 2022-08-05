<template>
  <div class="pa-4">
    <rc-data-table
      class="financialAssistanceOverview__table"
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :show-add-button="canAdd"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      @search="search"
      @add-button="routeToCreate">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.CaseFileFinancialAssistanceOverview"
          :filter-options="filters"
          :initial-filter="filterState"
          add-filter-label="financialAssistance.filter"
          :count="itemsCount"
          @update:appliedFilter="onApplyFilter">
          <template #toolbarActions>
            <v-btn height="32" color="primary" style="color: white" data-test="financialAssistanceOverview__statsButton" @click="showStats = true">
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
        <span data-test="fap_created"> {{ getLocalStringDate(item.entity.created, 'Entity.created', 'll') }}</span>
      </template>

      <template #[`item.${customColumns.totals}`]="{ item }">
        <div data-test="fap_total" class="amount">
          {{ $formatCurrency(item.metadata.total) }}
        </div>
      </template>

      <template #[`item.${customColumns.approvalStatus}`]="{ item }">
        <v-icon v-if="canViewHistory(item)" data-test="history-link" class="mr-2" @click="showApprovalDialog(item)">
          mdi-history
        </v-icon>
        <status-chip status-name="ApprovalStatus" :status="item.entity.approvalStatus" />
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
      <template #expanded-item="{ item }">
        <td>
          &nbsp;
        </td>
        <td :colspan="headers.length">
          <table class="rc-body10 details-table">
            <tbody>
              <template v-for="group in item.entity.groups">
                <tr v-if="group.status === Status.Active" :key="group.id">
                  <td class="group-col">
                    {{ getGroupTitle(group) }}
                  </td>
                  <td class="text-right">
                    {{ $formatCurrency(groupTotal([group])) }}
                  </td>
                  <td>
                    <v-icon size="12" color="grey darken-2">
                      mdi-arrow-right
                    </v-icon>
                  </td>
                  <td>
                    {{ $t('common.status') }}: {{ $t(`caseFile.financialAssistance.paymentStatus.${PaymentStatus[group.paymentStatus]}`) }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </td>
      </template>
    </rc-data-table>

    <rc-dialog
      v-if="showSubmitDialog"
      data-test="submit-dialog"
      :title="$t('caseFile.financialAssistance.submitDialog.title')"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="$t('common.submit')"
      :show.sync="showSubmitDialog"
      :submit-button-disabled="!selectedItems.length"
      :max-width="750"
      @close="showSubmitDialog = false"
      @cancel="showSubmitDialog = false"
      @submit="submitSelectedPayments">
      <div class="row col">
        {{ $t('caseFile.financialAssistance.submitDialog.message') }}
      </div>
      <div class="row list-row-header">
        <div class="col-auto pa-2">
          <v-checkbox
            v-model="itemsToSubmitSelectAll"
            hide-details
            class="mt-0" />
        </div>
        <div class="col">
          {{ $t('caseFile.financialAssistance.submitDialog.selectAll') }}
        </div>
      </div>
      <div v-for="fa in itemsToSubmit" :key="fa.entity.id" class="row list-row rc-body14">
        <div class="col-auto pa-2">
          <v-checkbox
            v-model="selectedItems"
            hide-details
            class="mt-0"
            :value="fa.entity.id" />
        </div>
        <div class="col fw-bold">
          {{ fa.entity.name }}
        </div>
        <div class="col-auto">
          {{ $formatCurrency(fa.metadata.total) }}
        </div>
      </div>
    </rc-dialog>

    <approval-history-dialog
      v-if="showApprovalHistory"
      :financial-assistance="selectedItem"
      :show.sync="showApprovalHistory" />

    <statistics-dialog
      v-if="showStats"
      :case-file-id="caseFileId"
      :show.sync="showStats" />
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
  RcDialog,
} from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import mixins from 'vue-typed-mixins';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { FilterKey } from '@libs/entities-lib/user-account';
import { IAzureSearchParams } from '@libs/core-lib/types';
import helpers from '@/ui/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  ApprovalStatus,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentCombined,
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PayeeType,
  PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { Status } from '@libs/entities-lib/base';
import { EPaymentModalities } from '@libs/entities-lib/program';
import ApprovalHistoryDialog from './components/ApprovalHistoryDialog.vue';
import StatisticsDialog from './components/StatisticsDialog.vue';
import caseFileDetail from '../caseFileDetail';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'FinancialAssistancePaymentsList',

  components: {
    RcDataTable,
    FilterToolbar,
    StatusChip,
    RcDialog,
    ApprovalHistoryDialog,
    StatisticsDialog,
  },

  data() {
    return {
      FilterKey,
      allItemsIds: [] as string[],
      searchResultIds: [] as string[],
      count: 0,
      options: {
        sortBy: ['Entity/Created'],
        sortDesc: [true],
      },
      tableProps: {
        showExpand: true,
        itemKey: 'entity.id',
        expandIcon: 'mdi-menu-down',
        loading: false,
        itemClass: (item: IFinancialAssistancePaymentCombined) => (item.pinned ? 'pinned' : ''),
      },
      getLocalStringDate: helpers.getLocalStringDate,
      containsActiveTables: null as boolean,
      showSubmitDialog: false,
      selectedItems: [] as string[],
      Status,
      PaymentStatus,
      groupTotal: FinancialAssistancePaymentGroup.total,
      showApprovalHistory: false,
      selectedItem: null as IFinancialAssistancePaymentEntity,
      showStats: false,
    };
  },

  computed: {

    tableData(): IFinancialAssistancePaymentCombined[] {
      return this.$storage.financialAssistancePayment.getters.getByIds(this.searchResultIds,
        {
          onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId },
        });
    },

    itemsToSubmit() : IFinancialAssistancePaymentCombined[] {
      return this.$storage.financialAssistancePayment.getters.getByIds(this.allItemsIds,
        {
          onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId },
        }).filter((fa) => fa.entity.approvalStatus === ApprovalStatus.New);
    },

    itemsToSubmitSelectAll: {
      get(): boolean {
        return this.itemsToSubmit.length === this.selectedItems.length;
      },
      set(value: boolean) {
        this.selectedItems = value ? this.itemsToSubmit.map((e: IFinancialAssistancePaymentCombined) => e.entity.id) : [];
      },
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
        width: '50%',
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

    filters(): Array<IFilterSettings> {
      return [{
        key: this.customColumns.name,
        type: EFilterType.Text,
        label: this.$t('common.name') as string,
      },
      {
        key: this.customColumns.created,
        type: EFilterType.Date,
        label: this.$t('caseFilesTable.filters.createdDate') as string,
      }];
    },

    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('caseFile.financialAssistance.overview', { count: this.itemsCount }),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('caseFile.financialAssistance.create.title'),
        },
      };
    },

    canAdd(): boolean {
      return this.$hasLevel('level1') && this.containsActiveTables != null && !this.readonly;
    },

    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    canDelete(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    if (!this.$hasRole('readonly')) {
      this.initContainsActiveTables();
    }
    // we fetch all the payments for the case file because we will need to submit all at once possibly if some arent submitted
    // and since ApprovalStatus is not filterable...  we will filter on the computed - not really a problem
    const res = await this.$storage.financialAssistancePayment.actions.search({
      filter: { 'Entity/CaseFileId': this.caseFileId },
    });
    this.allItemsIds = res.ids;
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await this.$storage.financialAssistancePayment.actions.search({
        search: params.search,
        filter: { 'Entity/CaseFileId': this.caseFileId, ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
    },

    async initContainsActiveTables() {
      if (this.caseFile) {
        const tableData = await this.$storage.financialAssistance.actions.search({
          filter: {
            'Entity/EventId': this.caseFile.entity.eventId,
          },
        });
        this.containsActiveTables = !!(tableData?.ids?.length);
      }
    },

    showApprovalDialog(item: IFinancialAssistancePaymentCombined) {
      this.selectedItem = item.entity;
      this.showApprovalHistory = true;
    },

    canViewHistory(item: IFinancialAssistancePaymentCombined): boolean {
      return item.entity.approvalStatus === ApprovalStatus.Approved;
    },

    isModifiable(item: IFinancialAssistancePaymentCombined) {
      return item.entity.approvalStatus === ApprovalStatus.New;
    },

    routeToCreate() {
      if (this.containsActiveTables) {
        this.$router.push({
          name: routes.caseFile.financialAssistance.create.name,
        });
      } else {
        this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.financialAssistance.noActiveTables') });
      }
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
      const doDelete = await this.$confirm({
        title: this.$t('caseFile.financialAssistance.confirm.delete.title'),
        messages: this.$t('caseFile.financialAssistance.confirm.delete.message'),
      });

      if (doDelete) {
        await this.$storage.financialAssistancePayment.actions.deactivate(item.entity.id);
      }
    },

    async submitSelectedPayments() {
      this.showSubmitDialog = false;
      let nbSuccess = 0;
      for (let i = 0; i < this.selectedItems.length; i += 1) {
        // we will do each request at a time because validation might conflict between each
        // eslint-disable-next-line no-await-in-loop
        if (await this.$storage.financialAssistancePayment.actions.submitFinancialAssistancePayment(this.selectedItems[i])) {
          nbSuccess += 1;
        }
      }
      if (nbSuccess === this.selectedItems.length) {
        this.$toasted.global.success(this.$t('caseFile.financialAssistance.toast.multipleApprovalSubmitted', { nbSuccess }));
      }
      this.selectedItems = [];
    },

    getGroupTitle(paymentGroup: IFinancialAssistancePaymentGroup) {
      if (FinancialAssistancePaymentGroup.showPayee(paymentGroup)) {
        const modality = this.$t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`);
        const payeeType = this.$t(`enums.payeeType.${PayeeType[paymentGroup.groupingInformation.payeeType]}`);

        return `${modality} (${payeeType}) - ${paymentGroup.groupingInformation.payeeName}`;
      }

      return this.$t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`);
    },
  },
});
</script>

<style scoped lang="scss">
.amount {
  font-weight: bold;
  text-align: right;
  min-width: 80px;
  display: inline-block;
}
.list-row-header {
  padding: 0px 16px;
}

::v-deep .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__row td {
  border-bottom: 0px !important;
}

::v-deep .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: initial !important;
  & td {
    height: initial;
  }
}

.details-table{
  min-width: 500px;
  & td {
    border: 0px !important;
    padding: 0px 6px;
  }
  & .group-col {
    min-width: 280px;
  }
}
</style>
