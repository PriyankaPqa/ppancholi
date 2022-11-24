<template>
  <div class="pa-4">
    <rc-data-table
      ref="approvalRequests"
      data-test="approval-requests"
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
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
        {{ item.entity.submittedBy? item.entity.submittedBy.userName : '' }}
      </template>

      <template #[`item.${customColumns.submittedTo}`]="{ item }">
        {{ item.entity.submittedTo? item.entity.submittedTo.userName: '' }}
      </template>

      <template #[`item.${customColumns.event}`]="{ item }">
        {{ item.metadata? $m(item.metadata.eventName) : '' }}
      </template>

      <template #[`item.${customColumns.submissionStartedDate}`]="{ item }">
        <div class="text-no-wrap">
          {{ item.entity.submissionStartedDate ? getLocalStringDate(item.entity.submissionStartedDate , '', 'll'): '-' }}
        </div>
      </template>

      <template #[`item.${customColumns.amount}`]="{ item }">
        <div class="text-no-wrap">
          {{ $formatCurrency(item.metadata.total) }}
        </div>
      </template>

      <template #[`item.${customColumns.actionable}`]="{ item }">
        <v-btn color="primary" data-test="action_button" @click="openActionDialog(item)">
          {{ $t('approval.requests.action.label') }}
        </v-btn>
      </template>
    </rc-data-table>

    <approval-action-dialog
      v-if="showActionDialog"
      :show.sync="showActionDialog"
      :financial-assistance-payment="paymentToAction"
      :my-role-id="myRoleId" />
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
import { IApprovalTableCombined } from '@libs/entities-lib/approvals/approvals-table';
import { FilterKey } from '@libs/entities-lib/user-account';
import {
  ApprovalStatus, IFinancialAssistancePaymentCombined,
} from '@libs/entities-lib/financial-assistance-payment';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import ApprovalRequestsFilter from '@/ui/mixins/approvalRequestsFilter';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import ApprovalActionDialog from './ApprovalActionDialog.vue';

export default mixins(TablePaginationSearchMixin, EventsFilterMixin, ApprovalRequestsFilter).extend({
  components: {
    FilterToolbar,
    RcAddButtonWithMenu,
    RcDataTable,
    StatusChip,
    ApprovalActionDialog,
  },

  data() {
    return {
      getLocalStringDate: helpers.getLocalStringDate,
      searchLoading: false,
      programs: [],
      FilterKey,
      submittedToMeSwitch: false,
      showActionDialog: false,
      paymentToAction: null as IFinancialAssistancePaymentCombined,
      options: {
        page: 1,
        sortBy: ['Entity/ApprovalStatus'],
        sortDesc: [false],
      },
    };
  },

  computed: {
    myUserId():string {
      return this.$storage.user.getters.userId();
    },

    myRoleId():string {
      return this.$store.state.userAccountEntities?.currentUserAccount?.roles[0]?.optionItemId || '';
    },

    tableData(): IFinancialAssistancePaymentCombined[] {
      return this.$storage.financialAssistancePayment.getters.getByIds(this.searchResultIds, {
        onlyActive: true,
        prependPinnedItems: false,
        baseDate: this.searchExecutionDate,
      });
    },

    presetFilter(): Record<string, unknown> {
      return {
        'Entity/ApprovalStatus': ApprovalStatus.Pending,
        'Entity/Status': Status.Active,
        Metadata: {
          CurrentApprovalGroupRoles: {
            any: {
              [ITEM_ROOT]: this.myRoleId,
            },
          },
        },
      };
    },

    submittedToMeFilter(): {'Entity/SubmittedTo': {UserId: string}} {
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
        actionable: 'Entity/ApprovalStatus',
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult} } {
      return {
        header: {
          title: this.$t('approval.title'),
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
        {
          text: this.$t('approvalRequestsTable.action') as string,
          align: 'end',
          sortable: false,
          width: '120px',
          value: this.customColumns.actionable,
        },
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
        itemClass: (item: IApprovalTableCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    getOrderBy(): string {
      const { orderBy, descending } = this.params;
      const direction = descending ? 'desc' : 'asc';
      if (orderBy === 'Entity/ApprovalStatus') {
        return `Entity/ApprovalStatus ${direction}, Entity/SubmissionStartedDate asc`;
      }

      return `${orderBy} ${direction}`;
    },
  },

  created() {
    // So filters are retrieved
    this.saveState = true;
    this.loadState();
    this.$storage.userAccount.actions.fetchRoles();
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
          const caseFileFilterValue = Object.values(this.submittedToMeFilter)[0];
          preparedFilters = _pickBy(this.userFilters, (value) => !_isEqual(caseFileFilterValue, value)); // Only filters from panel
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

    openActionDialog(payment: IFinancialAssistancePaymentCombined) {
      this.paymentToAction = payment;
      this.showActionDialog = true;
    },

    async onApplyFilterLocal(
      { preparedFilters, searchFilters }
        : { preparedFilters: Record<string, unknown>, searchFilters: string }, filterState: unknown,
    ) {
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

    additionalFilters() {
      return { submittedToMeFilter: this.submittedToMeSwitch };
    },

    setAdditionalFilters(state: {submittedToMeFilter: boolean}) {
      this.submittedToMeSwitch = !!state?.submittedToMeFilter || false;
    },
  },

});
</script>
