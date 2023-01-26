<template>
  <rc-data-table
    ref="caseFilesTable"
    data-test="case-files-table"
    :items="tableData"
    :count="itemsCount"
    :show-help="false"
    :help-link="$t(helpLink)"
    :labels="labels"
    :headers="headers"
    :footer-text="footerText"
    :table-props="tableProps"
    :hide-footer="hideFooter"
    :options.sync="options"
    :initial-search="params && params.search"
    :custom-columns="Object.values(customColumns)"
    @search="search">
    <template #filter>
      <filter-toolbar
        :filter-key="FilterKey.CaseFiles"
        :count="itemsCount"
        :filter-options="filters"
        :initial-filter="filterState"
        add-filter-label="caseFileTable.filter"
        @open="fetchEventsFilter()"
        @update:appliedFilter="onApplyFilterLocal"
        @update:autocomplete="onAutoCompleteUpdate($event)"
        @load:filter="throttleOnLoadFilter($event)">
        <template #toolbarActions>
          <div class="flex-row">
            <v-switch
              v-model="myCaseFiles"
              data-test="caseFilesTable__myCaseFilesSwitch"
              hide-details />
            <v-icon class="mr-2">
              mdi-account-check
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.myCaseFiles') }}
            </span>
          </div>
        </template>
      </filter-toolbar>
    </template>

    <template #[`item.${customColumns.caseFileNumber}`]="{ item: caseFile }">
      <div class="d-flex align-center ">
        <v-icon
          v-visible="caseFile.entity.assignedIndividualIds.includes(userId)"
          :data-test="`caseFilesTable__assignedIcon--${caseFile.caseFileNumber}`"
          small>
          mdi-account-check
        </v-icon>
        <router-link
          class="rc-link14 font-weight-bold px-1"
          :data-test="`caseFileDetail-link_${caseFile.entity.caseFileNumber}`"
          :to="getCaseFileRoute(caseFile)">
          {{ caseFile.entity.caseFileNumber }}
        </router-link>
        <v-icon
          v-if="caseFile.entity.isDuplicate"
          :data-test="`caseFilesTable__duplicateIcon--${caseFile.entity.caseFileNumber}`"
          small
          color="secondary">
          $rctech-duplicate
        </v-icon>
      </div>
    </template>

    <template #[`item.${customColumns.name}`]="{ item: caseFile }">
      <router-link
        v-if="caseFile.metadata"
        class="rc-link14"
        :data-test="`beneficiaryName-link_${getBeneficiaryName(caseFile)}`"
        :to="getHouseholdProfileRoute(caseFile)">
        {{ getBeneficiaryName(caseFile) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.event}`]="{ item: caseFile }">
      {{ caseFile.metadata && caseFile.metadata.event ? $m(caseFile.metadata.event.name) : "" }}
    </template>

    <template #[`item.${customColumns.triage}`]="{ item: caseFile }">
      {{ caseFile.metadata ? $m(caseFile.metadata.triageName) : "" }}
    </template>

    <template #[`item.${customColumns.status}`]="{ item: caseFile }">
      <status-chip status-name="CaseFileStatus" :status="caseFile.entity.caseFileStatus" />
    </template>

    <template #[`item.${customColumns.created}`]="{ item: caseFile }">
      {{ getLocalStringDate(caseFile.entity.created, 'Entity.created', 'll') }}
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { DataTableHeader } from 'vuetify';
import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';

import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import {
  ICaseFileCombined, CaseFileStatus, CaseFileTriage,
} from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { FilterKey } from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import { useUserStore } from '@/pinia/user/user';

export default mixins(TablePaginationSearchMixin, EventsFilterMixin).extend({
  name: 'CaseFilesTable',

  components: {
    RcDataTable,
    StatusChip,
    FilterToolbar,
  },

  props: {
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
      CaseFileStatus,
      FilterKey,
      myCaseFiles: null as boolean,
      getLocalStringDate: helpers.getLocalStringDate,
      helpLink: 'zendesk.help_link.caseFilesTable',
      searchEventsResultIds: [] as string[],
      searchLoading: false,
      searchEventMethod: 'searchMyEvents',
      options: {
        page: 1,
        sortBy: ['Entity/Created'],
        sortDesc: [true],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
    };
  },

  async created() {
    this.saveState = true;
    this.loadState();
  },

  computed: {
    userId():string {
      return useUserStore().getUserId();
    },

    myCaseFilesFilter(): Record<string, unknown> {
      return {
        Entity: {
          AssignedIndividualIds: {
            any: this.userId,
          },
        },
      };
    },

    tableData(): ICaseFileCombined[] {
      return this.$storage.caseFile.getters.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Entity/CaseFileNumber',
        name: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
        event: `Metadata/Event/Name/Translation/${this.$i18n.locale}`,
        triage: `Metadata/TriageName/Translation/${this.$i18n.locale}`,
        status: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
        created: 'Entity/Created',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFileTable.tableHeaders.caseFileNumber') as string,
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.event') as string,
          sortable: true,
          value: this.customColumns.event,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.triage') as string,
          sortable: true,
          value: this.customColumns.triage,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.status') as string,
          sortable: true,
          value: this.customColumns.status,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.createdDate') as string,
          sortable: true,
          value: this.customColumns.created,
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.firstName') as string,
        },
        {
          key: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.lastName') as string,
        },
        {
          key: 'Entity/EventId',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.eventName') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          disabled: this.eventsFilterDisabled,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: `Metadata/TriageName/Translation/${this.$i18n.locale}`,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.triage') as string,
          items: helpers.enumToTranslatedCollection(CaseFileTriage, 'enums.Triage', true),
        },
        {
          key: 'Entity/Created',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.createdDate') as string,
        },
        {
          key: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.status') as string,
          items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
        },
        {
          key: 'Entity/IsDuplicate',
          type: EFilterType.Select,
          label: this.$t('caseFilesTable.filters.isDuplicate') as string,
          items: [{
            text: this.$t('common.yes') as string,
            value: true,
          }, {
            text: this.$t('common.no') as string,
            value: false,
          }],
        },
        {
          key: 'Entity/AssignedIndividualIds',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.isAssigned') as string,
          items: [{
            text: this.$t('common.yes') as string,
            value: 'arrayNotEmpty',
          }, {
            text: this.$t('common.no') as string,
            value: 'arrayEmpty',
          }],
        },
        {
          key: 'Metadata/LastActionDate',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.lastActionDate') as string,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t('caseFiles_table.title')} (${this.itemsCount})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.searchLoading,
        itemClass: (item: ICaseFileCombined) => (item.pinned ? 'pinned' : ''),
      };
    },
  },

  watch: {
    myCaseFiles(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }
      let preparedFilters = {} as Record<string, unknown>;
      if (newValue) {
        // We apply filters from the switch + the ones from the filters panel
        preparedFilters = { ...this.userFilters, ...this.myCaseFilesFilter };
      } else if (isEqual(this.myCaseFilesFilter, this.userFilters)) { // If the only filter is myCaseFile
        preparedFilters = null;
      } else {
        const caseFileFilterValue = Object.values(this.myCaseFilesFilter)[0];
        preparedFilters = pickBy(this.userFilters, (value) => !isEqual(caseFileFilterValue, value)); // Only filters from panel
      }

      this.onApplyFilter({ preparedFilters, searchFilters: this.userSearchFilters }, this.filterState);
    },
  },

  methods: {
    additionalFilters() {
      return { myCaseFilesFilter: this.myCaseFiles };
    },

    setAdditionalFilters(state: unknown) {
      // eslint-disable-next-line
      this.myCaseFiles = (state as any)?.myCaseFilesFilter || false;
    },

    async fetchData(params: IAzureSearchParams) {
      this.searchLoading = false;
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
      return res;
    },

    getBeneficiaryName(caseFile: ICaseFileCombined): string {
      if (!caseFile?.metadata?.primaryBeneficiary?.identitySet) {
        return '';
      }

      const { firstName, lastName } = caseFile.metadata.primaryBeneficiary.identitySet;

      return `${firstName} ${lastName}`;
    },

    getHouseholdProfileRoute(caseFile: ICaseFileCombined) {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: caseFile.entity?.householdId,
        },
      };
    },

    getCaseFileRoute(caseFile: ICaseFileCombined) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: caseFile.entity.id,
        },
      };
    },

    async onApplyFilterLocal({ preparedFilters, searchFilters }
    : { preparedFilters: Record<string, unknown>, searchFilters: string }, filterState: unknown) {
      let finalFilters = {};
      if (this.myCaseFiles) {
        finalFilters = isEmpty(preparedFilters) ? this.myCaseFilesFilter : { ...preparedFilters, ...this.myCaseFilesFilter };
      } else {
        finalFilters = isEmpty(preparedFilters) ? null : preparedFilters;
      }
      await this.onApplyFilter({ preparedFilters: finalFilters, searchFilters }, filterState);
    },

    getTableName():string {
      return 'case-files';
    },
  },

});
</script>
