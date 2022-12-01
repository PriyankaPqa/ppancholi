<template>
  <div class="ma-0 pa-0">
    <rc-data-table
      :ref="`ApprovalRequests${isPendingRequests ? 'Pending' : 'Approved'}`"
      data-test="approval-requests-pending"
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      hide-header
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :initial-search="params && params.search"
      :options.sync="options"
      :custom-columns="[...Object.values(customColumns), 'actions']"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.ApprovalRequests"
          :filter-options="filters"
          :initial-filter="filterState"
          :count="itemsCount"
          add-filter-label="approval.requests.filter.title"
          @open="onOpenFilters()"
          @update:appliedFilter="onApplyFilterLocal"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @load:filter="throttleOnLoadFilter($event)">
          <template #toolbarActions>
            <div class="flex-row">
              <v-switch
                v-model="submittedToMeSwitch"
                data-test="approval-requests__submittedToMeSwitch"
                hide-details />
              <v-icon class="mr-2">
                mdi-account-check
              </v-icon>
              <span class="rc-body14">
                {{ $t('approval.requests.submittedToMe') }}
              </span>
            </div>
            <v-divider vertical class="mx-3" />
            <v-text-field
              :value="searchTerm"
              class="search-box"
              data-test="search"
              :placeholder="labels.header.searchPlaceholder"
              clearable
              prepend-inner-icon="mdi-magnify"
              background-color="grey lighten-4"
              outlined
              hide-details
              dense
              @click:clear="onSearchTermInput('')"
              @input="onSearchTermInput" />
          </template>
        </filter-toolbar>
      </template>

      <template #[`item.${customColumns.caseFileNumber}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          data-test="approval_requests_case-file-link"
          :to="getCaseFileDetailsRoute(item.entity.caseFileId)">
          {{ item.metadata ? item.metadata.caseFileNumber : '' }}
        </router-link>
      </template>

      <template #[`item.${customColumns.payment}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          data-test="approval_requests_fa-link"
          :to="getFinancialAssistanceDetailsRoute(item.entity.caseFileId, item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.submittedBy}`]="{ item }">
        {{ item.entity.submittedBy ? item.entity.submittedBy.userName : '' }}
      </template>

      <template #[`item.${customColumns.submittedTo}`]="{ item }">
        {{ item.entity.submittedTo ? item.entity.submittedTo.userName : '' }}
      </template>

      <template #[`item.${customColumns.event}`]="{ item }">
        {{ item.metadata ? $m(item.metadata.eventName) : '' }}
      </template>

      <template #[`item.${customColumns.submissionStartedDate}`]="{ item }">
        <div class="text-no-wrap">
          {{ item.entity.submissionStartedDate ? getLocalStringDate(item.entity.submissionStartedDate, '', 'll') : '-' }}
        </div>
      </template>

      <template #[`item.${customColumns.amount}`]="{ item }">
        <div class="text-no-wrap">
          {{ $formatCurrency(item.metadata.total) }}
        </div>
      </template>

      <template #[`item.${customColumns.actionable}`]="{ item }">
        <v-btn v-if="!isActionDone(item.entity.id)" color="primary" data-test="action_button" @click="openActionDialog(item)">
          {{ $t('approval.requests.action.label') }}
        </v-btn>
        <v-icon v-else left>
          mdi-check
        </v-icon>
      </template>
    </rc-data-table>

    <approval-action-dialog
      v-if="showActionDialog"
      :show.sync="showActionDialog"
      :financial-assistance-payment="paymentToAction"
      :my-role-id="myRoleId"
      @updateItems="updateActionedItems" />
  </div>
</template>

<script lang="ts">
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _pickBy from 'lodash/pickBy';
import mixins from 'vue-typed-mixins';
import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';
import { DataTableHeader } from 'vuetify';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import { RcAddButtonWithMenu, RcDataTable } from '@libs/component-lib/components';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { ApprovalStatus, IFinancialAssistancePaymentCombined } from '@libs/entities-lib/financial-assistance-payment';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import ApprovalRequestsFilter from '@/ui/mixins/approvalRequestsFilter';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import ApprovalActionDialog from './ApprovalActionDialog.vue';

interface IMappedPayment extends IFinancialAssistancePaymentCombined {
  isActionable: boolean;
  nextRoleGroup: string[];
  excludedUsers: string[];
}

export default mixins(TablePaginationSearchMixin, EventsFilterMixin, ApprovalRequestsFilter).extend({
  components: {
    FilterToolbar,
    RcAddButtonWithMenu,
    RcDataTable,
    StatusChip,
    ApprovalActionDialog,
  },

  props: {
    isPendingRequests: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      getLocalStringDate: helpers.getLocalStringDate,
      searchLoading: false,
      FilterKey,
      submittedToMeSwitch: false,
      showActionDialog: false,
      paymentToAction: null as IMappedPayment,
      actionedItems: [] as string[],
      options: {
        page: 1,
        sortBy: ['Entity/SubmissionStartedDate'],
        sortDesc: [!this.isPendingRequests],
      },
      searchTerm: '',
    };
  },

  computed: {
    myUserId():string {
      return this.$storage.user.getters.userId();
    },

    myRoleId():string {
      return this.$store.state.userAccountEntities?.currentUserAccount?.roles[0]?.optionItemId;
    },

    tableData(): IFinancialAssistancePaymentCombined[] {
      return this.$storage.financialAssistancePayment.getters.getByIds(this.searchResultIds, {
        onlyActive: true,
        prependPinnedItems: false,
        baseDate: this.searchExecutionDate,
      });
    },

    presetFilter(): Record<string, unknown> {
      const approvedRequestsFilter = {
        Entity: {
          ApprovalTableGroupsSnapshots: {
            any: {
              Roles: {
                any: {
                  [ITEM_ROOT]: this.myRoleId,
                },
              },
            },
          },
        },
      };

      const pendingRequestsFilter = {
        Metadata: {
          CurrentApprovalGroupRoles: {
            any: {
              [ITEM_ROOT]: this.myRoleId,
            },
          },
        },
        not: {
          Entity: {
            SubmittedBy: {
              UserId: this.myUserId,
            },
          },
        },
      };

      return {
        or: [
          { 'Entity/ApprovalStatus': this.isPendingRequests ? ApprovalStatus.Pending : ApprovalStatus.Approved },
        ],
        'Entity/Status': Status.Active,
        ...this.isPendingRequests ? pendingRequestsFilter : approvedRequestsFilter,
      };
    },

    submittedToMeFilter(): { 'Entity/SubmittedTo': { UserId: string } } {
      return {
        'Entity/SubmittedTo': {
          UserId: this.myUserId,
        },
      };
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Metadata/CaseFileNumber',
        payment: 'Entity/Name',
        submittedBy: 'Entity/SubmittedBy/UserName',
        submittedTo: 'Entity/SubmittedTo/UserName',
        event: `Metadata/EventName/Translation/${this.$i18n.locale}`,
        submissionStartedDate: 'Entity/SubmissionStartedDate',
        amount: 'Metadata/Total',
        ...this.isPendingRequests ? { actionable: 'action' } : {},
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.isPendingRequests ? this.$t('approval.requests.title.pending') : this.$t('approval.requests.title.approved'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('approvalRequestsTable.caseFileNumber') as string,
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('approvalRequestsTable.payment') as string,
          sortable: true,
          value: this.customColumns.payment,
        },
        {
          text: this.$t('approvalRequestsTable.submittedBy') as string,
          sortable: true,
          value: this.customColumns.submittedBy,
        },
        {
          text: this.$t('approvalRequestsTable.submittedTo') as string,
          sortable: true,
          value: this.customColumns.submittedTo,
        },
        {
          text: this.$t('approvalRequestsTable.event') as string,
          sortable: true,
          value: this.customColumns.event,
        },
        {
          text: this.$t('approvalRequestsTable.dateSubmitted') as string,
          sortable: true,
          value: this.customColumns.submissionStartedDate,
        },
        {
          text: this.$t('approvalRequestsTable.amount') as string,
          sortable: true,
          align: 'end',
          value: this.customColumns.amount,
        },
        ...this.isPendingRequests ? [{
          text: this.$t('approvalRequestsTable.action') as string,
          align: 'center' as 'start' | 'center' | 'end',
          sortable: true,
          width: '120px',
          value: this.customColumns.actionable,
        }] : [],
      ];
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: this.customColumns.payment,
          type: EFilterType.Text,
          label: this.$t('approvalRequestsTable.payment') as string,
        },
        {
          key: 'Entity/SubmittedBy/UserId',
          type: EFilterType.MultiSelect,
          label: this.$t('approvalRequestsTable.submittedBy') as string,
          items: this.submittedByUsers,
          loading: this.submittedLoading.by,
          props: {
            'no-data-text': !this.submittedByQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.submittedByQuery,
            'no-filter': true,
            'return-object': false,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: 'Entity/SubmittedTo/UserId',
          type: EFilterType.MultiSelect,
          label: this.$t('approvalRequestsTable.submittedTo') as string,
          items: this.submittedToUsers,
          loading: this.submittedLoading.to,
          props: {
            'no-data-text': !this.submittedToQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.submittedToQuery,
            'no-filter': true,
            'return-object': false,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: 'Metadata/EventId',
          type: EFilterType.Select,
          label: this.$t('approvalRequestsTable.event') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: this.customColumns.submissionStartedDate,
          type: EFilterType.Date,
          label: this.$t('approvalRequestsTable.dateSubmitted') as string,
        },
        {
          key: this.customColumns.amount,
          type: EFilterType.Number,
          label: this.$t('approvalRequestsTable.amount') as string,
        },
      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.searchLoading,
      };
    },

  },

  created() {
    // So filters are retrieved
    this.saveState = true;
    this.loadState();
  },

  watch: {
    submittedToMeSwitch(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }

      if (newValue) {
        const preparedFilters = { ...this.userFilters, ...this.submittedToMeFilter };
        // We apply filters from the switch + the ones from the filters panel
        this.onApplyFilter({ preparedFilters }, this.filterState);
      } else {
        let preparedFilters = {} as Record<string, unknown>;
        if (_isEqual(this.submittedToMeFilter, this.userFilters)) { // If the only filter is submittedToMe
          preparedFilters = null;
        } else {
          const requestFilterValue = Object.values(this.submittedToMeFilter)[0];
          preparedFilters = _pickBy(this.userFilters, (value) => !_isEqual(requestFilterValue, value)); // Only filters from panel
        }
        this.onApplyFilter({ preparedFilters }, this.filterState);
      }
    },
  },

  methods: {
    getFinancialAssistanceDetailsRoute(caseFileId: string, fapId: string) {
      return {
        name: routes.caseFile.financialAssistance.details.name,
        params: {
          id: caseFileId,
          financialAssistancePaymentId: fapId,
        },
      };
    },

    getCaseFileDetailsRoute(id: string) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id,
        },
      };
    },

    openActionDialog(payment: IMappedPayment) {
      this.paymentToAction = payment;
      this.showActionDialog = true;
    },

    async onApplyFilterLocal({ preparedFilters, searchFilters }
        : { preparedFilters: Record<string, unknown>, searchFilters: string }, filterState: unknown) {
      let finalFilters = {};
      if (this.submittedToMeSwitch) {
        finalFilters = _isEmpty(preparedFilters) ? this.submittedToMeFilter : { ...preparedFilters, ...this.submittedToMeFilter };
      } else {
        finalFilters = _isEmpty(preparedFilters) ? null : preparedFilters;
      }

      await this.onApplyFilter({ preparedFilters: finalFilters, searchFilters }, filterState);
    },

    async fetchData(params: IAzureSearchParams) {
      this.searchLoading = true;
      if (_isEmpty(params.filter)) {
        params.filter = this.presetFilter;
      }
      const res = await this.$storage.financialAssistancePayment.actions.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);

      this.searchLoading = false;
      return res;
    },

    updateActionedItems(paymentId: string) {
      this.actionedItems.push(paymentId);
    },

    isActionDone(paymentId:string) {
      return this.actionedItems.includes(paymentId);
    },

    additionalFilters() {
      return { submittedToMeFilter: this.submittedToMeSwitch, searchTerm: this.searchTerm };
    },

    setAdditionalFilters(state: { submittedToMeFilter: boolean, searchTerm: '' }) {
      this.submittedToMeSwitch = !!state?.submittedToMeFilter || false;
      this.searchTerm = state?.searchTerm || '';
    },

    getTableName():string {
      return this.isPendingRequests ? 'PendingRequests' : 'ApprovedRequests';
    },
  },

});
</script>

<style scoped lang="scss">
  .search-box{
    flex: none;
    width: 242px;
  }

  ::v-deep .dataTable__container {
  box-shadow: none !important;
}
::v-deep .v-sheet.v-card{
  box-shadow: none !important;
}
</style>
