<template>
  <rc-data-table
    ref="caseFilesTable"
    data-test="case-files-table"
    :items="tableData"
    :count="itemsCount"
    :show-help="true"
    :help-link="$t(helpLink)"
    :labels="labels"
    :headers="headers"
    :table-props="tableProps"
    :hide-footer="hideFooter"
    :options.sync="options"
    :custom-columns="Object.values(customColumns)"
    @search="search">
    <template #filter>
      <filter-toolbar
        :filter-key="FilterKey.CaseFiles"
        :count="itemsCount"
        :filter-options="filters"
        @open="fetchEventsFilter"
        @update:appliedFilter="onApplyFilterLocal">
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
          data-test="caseFileDetail-link"
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
        data-test="beneficiaryName-link"
        :to="getHouseholdProfileRoute(caseFile)">
        {{ getBeneficiaryName(caseFile) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.event}`]="{ item: caseFile }">
      {{ caseFile.metadata && caseFile.metadata.event? $m(caseFile.metadata.event.name): "" }}
    </template>

    <template #[`item.${customColumns.triage}`]="{ item: caseFile }">
      {{ caseFile.metadata? $m(caseFile.metadata.triageName): "" }}
    </template>

    <template #[`item.${customColumns.status}`]="{ item: caseFile }">
      <status-chip status-name="CaseFileStatus" :status="caseFile.entity.caseFileStatus" />
    </template>

    <template #[`item.${customColumns.created}`]="{ item: caseFile }">
      {{ getLocalStringDate(caseFile.entity.created, 'll') }}
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
  IFilterSettings,
} from '@crctech/component-library';
import { EFilterType } from '@crctech/component-library/src/types/FilterTypes';

import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { ICaseFileCombined, CaseFileStatus, CaseFileTriage } from '@/entities/case-file';
import helpers from '@/ui/helpers';
import { FilterKey } from '@/entities/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureTableSearchResults } from '@/types/interfaces/IAzureSearchResult';
import { IEventCombined, EEventStatus } from '@/entities/event';

export default mixins(TablePaginationSearchMixin).extend({
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
      itemsCount: 0,
      FilterKey,
      myCaseFiles: false,
      getLocalStringDate: helpers.getLocalStringDate,
      helpLink: 'zendesk.help_link.caseFilesTable',
      searchResultIds: [] as string[],
      searchEventsResultIds: [] as string[],
      eventsFilter: [] as IEventCombined[],
      eventsFilterLoading: false,
      searchLoading: false,
      options: {
        page: 1,
        sortBy: ['Entity/Created'],
        sortDesc: [true],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
    };
  },

  computed: {
    userId():string {
      return this.$storage.user.getters.userId();
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
      return this.$storage.caseFile.getters.getByIds(this.searchResultIds);
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Entity/CaseFileNumber',
        name: 'Metadata/PrimaryBeneficiaryFirstName',
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
          key: 'Metadata/PrimaryBeneficiaryFirstName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.firstName') as string,
        },
        {
          key: 'Metadata/PrimaryBeneficiaryLastName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.lastName') as string,
        },
        {
          key: 'Entity/EventId',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.eventName') as string,
          items: this.eventsFilter,
          loading: this.eventsFilterLoading,
          disabled: this.eventsFilterLoading,
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
            text: this.$t('common.yes'),
            value: true,
          }, {
            text: this.$t('common.no'),
            value: false,
          }],
        },
        {
          key: 'Entity/AssignedIndividualIds',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.isAssigned') as string,
          items: [{
            text: this.$t('common.yes'),
            value: 'arrayNotEmpty',
          }, {
            text: this.$t('common.no'),
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
      };
    },
  },

  watch: {
    myCaseFiles(newValue) {
      if (newValue) {
        // We apply filters from the switch + the ones from the filters panel
        this.onApplyFilter({ preparedFilters: { ...this.userFilters, ...this.myCaseFilesFilter } });
      } else {
        let preparedFilters = {};
        if (isEqual(this.myCaseFilesFilter, this.userFilters)) { // If the only filter is myCaseFile
          preparedFilters = null;
        } else {
          const caseFileFilterValue = Object.values(this.myCaseFilesFilter)[0];
          preparedFilters = pickBy(this.userFilters, (value) => !isEqual(caseFileFilterValue, value)); // Only filters from panel
        }
        this.onApplyFilter({ preparedFilters });
      }
    },
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      try {
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
        this.setResults(res);
        return res; // Keep using the mixin in the current form until all entities searches are updated
      } finally {
        this.searchLoading = false;
      }
    },

    setResults(res: IAzureTableSearchResults) {
      this.itemsCount = res.count;
      this.searchResultIds = res.ids;
    },

    getBeneficiaryName(caseFile: ICaseFileCombined): string {
      if (!caseFile.metadata) return '';

      const { primaryBeneficiaryFirstName, primaryBeneficiaryLastName } = caseFile.metadata;
      return `${primaryBeneficiaryFirstName} ${primaryBeneficiaryLastName}`;
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

    async fetchEventsFilter() {
      this.eventsFilterLoading = true;
      try {
        const res = await this.$storage.caseFile.actions.search({
          filter: {
            or: [
              {
                Metadata: {
                  Event: {
                    Status: EEventStatus.Open.toString(),
                  },
                },
              },
              {
                Metadata: {
                  Event: {
                    Status: EEventStatus.OnHold.toString(),
                  },
                },
              },
            ],
          },
          top: 999,
          orderBy: `Metadata/Event/Name/Translation/${this.$i18n.locale} asc`,
          queryType: 'full',
          searchMode: 'all',
        });
        this.eventsFilter = this.$storage.caseFile.getters.getByIds(res.ids)
          .map((c: ICaseFileCombined) => ({ text: this.$m(c.metadata.event.name), value: c.metadata.event.id }));
      } finally {
        this.eventsFilterLoading = false;
      }
    },

    async onApplyFilterLocal(
      { preparedFilters, searchFilters }
        : { preparedFilters: Record<string, unknown>, searchFilters: Record<string, unknown> },
    ) {
      let finalFilters = {};
      if (this.myCaseFiles) {
        finalFilters = isEmpty(preparedFilters) ? this.myCaseFilesFilter : { ...preparedFilters, ...this.myCaseFilesFilter };
      } else {
        finalFilters = isEmpty(preparedFilters) ? null : preparedFilters;
      }
      await this.onApplyFilter({ preparedFilters: finalFilters, searchFilters });
    },
  },

});
</script>
