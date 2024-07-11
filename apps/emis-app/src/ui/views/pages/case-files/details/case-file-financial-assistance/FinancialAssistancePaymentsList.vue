<template>
  <div class="pa-4">
    <rc-data-table
      class="financialAssistanceOverview__table"
      data-test="financialAssistanceOverview__table"
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
          :sql-mode="true"
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
          :data-test="`fap_link_${item.id}`"
          :to="getFapDetailsRoute(item.id)">
          {{ item.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.created}`]="{ item }">
        <span data-test="fap_created" class="text-no-wrap">
          {{ getLocalStringDate(item.created, 'Entity.created', 'PP') }}
        </span>
      </template>

      <template #[`item.${customColumns.totals}`]="{ item }">
        <div data-test="fap_total" class="amount">
          {{ $formatCurrency(groupTotal(item.groups)) }}
        </div>
      </template>

      <template #[`item.${customColumns.approvalStatus}`]="{ item }">
        <v-icon
          v-if="canViewHistory(item)"
          data-test="history-link"
          :aria-label="$t('caseFile.financialAssistance.approvalHistory')"
          class="mr-2"
          @click="showApprovalDialog(item)">
          mdi-history
        </v-icon>
        <status-chip :data-test="`approval_status_${item.id}`" status-name="ApprovalStatus" :status="item.approvalStatus" />
      </template>

      <template #[`item.edit`]="{ item }">
        <v-btn v-if="isModifiable(item)" icon data-test="edit-link" :aria-label="$t('common.edit')" :to="getFapEditRoute(item.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.delete`]="{ item }">
        <v-btn v-if="isModifiable(item)" icon data-test="delete-link" :aria-label="$t('common.delete')" @click="deletePayment(item)">
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
              <template v-for="group in item.groups">
                <tr v-if="group.status === Status.Active" :key="group.id">
                  <td class="group-col" data-test="caseFile-financialAssistance-expand-groupTitle">
                    {{ getGroupTitle(group) }}
                  </td>
                  <td class="text-right" data-test="caseFile-financialAssistance-expand-groupTotal">
                    {{ $formatCurrency(groupTotal([group])) }}
                  </td>
                  <td>
                    <v-icon size="12" color="grey darken-2">
                      mdi-arrow-right
                    </v-icon>
                  </td>
                  <td data-test="caseFile-financialAssistance-expand-groupPaymentStatus">
                    {{ $t('common.status') }}: {{ $t(`caseFile.financialAssistance.paymentStatus.${PaymentStatus[group.paymentStatus]}`) }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </td>
      </template>
    </rc-data-table>

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
} from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import mixins from 'vue-typed-mixins';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { FilterKey } from '@libs/entities-lib/user-account';
import { ISearchParams, Status } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  ApprovalAction,
  ApprovalStatus,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PayeeType,
  PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { usePotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate';
import { UserRoles } from '@libs/entities-lib/user';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { IPotentialDuplicateEntity, DuplicateStatus } from '@libs/entities-lib/potential-duplicate';
import ApprovalHistoryDialog from './components/ApprovalHistoryDialog.vue';
import StatisticsDialog from './components/StatisticsDialog.vue';
import caseFileDetail from '../caseFileDetail';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'FinancialAssistancePaymentsList',

  components: {
    RcDataTable,
    FilterToolbar,
    StatusChip,
    ApprovalHistoryDialog,
    StatisticsDialog,
  },

  data() {
    return {
      FilterKey,
      searchResultIds: [] as string[],
      count: 0,
      options: {
        sortBy: ['Entity/Created'],
        sortDesc: [true],
      },
      tableProps: {
        showExpand: true,
        itemKey: 'id',
        expandIcon: 'mdi-menu-down',
        loading: false,
        itemClass: (item: IFinancialAssistancePaymentEntity) => (item.pinned ? 'pinned' : ''),
      },
      getLocalStringDate: helpers.getLocalStringDate,
      containsActiveTables: null as boolean,
      hasRestrictFinancialTags: false,
      Status,
      PaymentStatus,
      groupTotal: FinancialAssistancePaymentGroup.total,
      showApprovalHistory: false,
      selectedItem: null as IFinancialAssistancePaymentEntity,
      showStats: false,
      householdDuplicates: null as IPotentialDuplicateEntity[],
    };
  },

  computed: {

    tableData(): IFinancialAssistancePaymentEntity[] {
      return useFinancialAssistancePaymentStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        {
          onlyActive: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId },
        },
      );
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
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          align: 'end',
          value: this.customColumns.edit,
          width: '5%',
        });
      }

      if (this.canDelete) {
        headers.push({
          text: this.$t('common.delete') as string,
          class: 'rc-transparent-text',
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
          title: this.$t('caseFile.financialAssistance.overview', { count: this.tableData ? this.tableData.length : 0 }),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('caseFile.financialAssistance.create.title'),
        },
      };
    },

    canAdd(): boolean {
      return this.$hasLevel(UserRoles.level1) && this.containsActiveTables != null && !this.readonly;
    },

    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    canDelete(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    isDuplicate(): boolean {
      return this.householdDuplicates?.some((d) => d.duplicateStatus === DuplicateStatus.Potential);
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    if (!this.$hasRole(UserRoles.readonly)) {
      await useCaseFileStore().fetchTagsOptions();
      this.checkHasRestrictFinancialTags();

      await this.initContainsActiveTables();
    }
    if (this.canAdd) {
      this.householdDuplicates = await usePotentialDuplicateStore().getDuplicates(this.caseFile.householdId);
    }
  },

  methods: {
    async fetchData(params: ISearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await useFinancialAssistancePaymentStore().search({ params: {
        filter: { 'Entity/CaseFileId': { value: this.caseFileId, type: EFilterKeyType.Guid }, ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      },
      includeInactiveItems: false });
      return res;
    },

    async initContainsActiveTables() {
      if (this.caseFile) {
        const tableData = await useFinancialAssistanceStore().search({ params: {
          filter: { 'Entity/EventId': { value: this.caseFile.eventId, type: EFilterKeyType.Guid } },
        },
        includeInactiveItems: false });
        this.containsActiveTables = !!(tableData?.ids?.length);
      }
    },

    async checkHasRestrictFinancialTags() {
      if (this.caseFile) {
        const caseFileTagIds = this.caseFile.tags.map((t) => t.optionItemId);
        const tags = useCaseFileStore().getTagsOptions(true);
        this.hasRestrictFinancialTags = caseFileTagIds.some((id) => tags.some((t) => t.id === id && t.restrictFinancial));
      }
    },

    showApprovalDialog(item: IFinancialAssistancePaymentEntity) {
      this.selectedItem = item;
      this.showApprovalHistory = true;
    },

    canViewHistory(item: IFinancialAssistancePaymentEntity): boolean {
      return (item.approvalStatus !== ApprovalStatus.New || item.approvalAction === ApprovalAction.RequestAdditionalInfo)
      && !!item.approvalStatusHistory?.length;
    },

    isModifiable(item: IFinancialAssistancePaymentEntity) {
      return item.approvalStatus === ApprovalStatus.New;
    },

    routeToCreate() {
      if (this.householdDuplicates == null) {
        return;
      }
      if (this.isDuplicate) {
        this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.financialAssistance.error.potentialDuplicate') });
        return;
      }

      if (this.containsActiveTables) {
        if (!this.hasRestrictFinancialTags) {
          this.$router.push({
            name: routes.caseFile.financialAssistance.create.name,
          });
        } else {
          this.$message({ title: this.$t('common.error'), message: this.$t('caseFile.financialAssistance.cannotAddDueToTags') });
        }
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

    async deletePayment(item: IFinancialAssistancePaymentEntity) {
      const doDelete = await this.$confirm({
        title: this.$t('caseFile.financialAssistance.confirm.delete.title'),
        messages: this.$t('caseFile.financialAssistance.confirm.delete.message'),
      });

      if (doDelete) {
        await useFinancialAssistancePaymentStore().deactivate(item.id);
      }
    },

    getGroupTitle(paymentGroup: IFinancialAssistancePaymentGroup) {
      if (FinancialAssistancePaymentGroup.showPayee(paymentGroup)) {
        const modality = this.$t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`);
        const payeeType = this.$t(`enums.payeeType.new.${PayeeType[paymentGroup.groupingInformation.payeeType]}`);

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

::v-deep .v-data-table > .v-data-table__wrapper tbody tr:not(.v-data-table__expanded) td:nth-last-child(1),
::v-deep .v-data-table > .v-data-table__wrapper tbody tr:not(.v-data-table__expanded) td:nth-last-child(2){
    padding:0;
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
    padding: 0px 6px !important;
  }
  & .group-col {
    min-width: 280px;
  }
}
</style>
