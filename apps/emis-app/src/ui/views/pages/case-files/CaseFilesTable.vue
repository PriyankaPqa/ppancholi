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
        :sql-mode="true"
        add-filter-label="caseFileTable.filter"
        @open="fetchEventsFilter()"
        @update:appliedFilter="onApplyFilterLocal"
        @update:autocomplete="onAutoCompleteUpdate($event)"
        @load:filter="throttleOnLoadFilter($event, 'SearchItem/EventId')">
        <template #toolbarActions>
          <div class="flex-row">
            <v-switch
              v-model="myCaseFiles"
              data-test="caseFilesTable__myCaseFilesSwitch"
              :aria-label="$t('caseFilesTable.myCaseFiles')"
              hide-details />
            <v-icon class="mr-2">
              mdi-account-check
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.myCaseFiles') }}
            </span>
          </div>

          <v-divider vertical class="mx-3" />
          <div class="flex-row">
            <v-switch
              v-model="duplicatesOnly"
              data-test="caseFilesTable__duplicatesOnlySwitch"
              :aria-label="$t('caseFilesTable.duplicates')"
              hide-details />
            <v-icon class="mx-2" small>
              $rctech-duplicate
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.duplicates') }}
            </span>
          </div>

          <v-divider vertical class="mx-3" />
          <div class="flex-row">
            <v-switch
              v-model="recentlyViewedOnly"
              data-test="caseFilesTable__recentlyViewedSwitch"
              :aria-label="$t('caseFilesTable.recentlyViewed')"
              hide-details />
            <v-icon class="mr-2">
              mdi-eye
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.recentlyViewed') }}
            </span>
          </div>
        </template>
      </filter-toolbar>
    </template>

    <template #[`item.${customColumns.caseFileNumber}`]="{ item: caseFile }">
      <div class="d-flex align-center ">
        <v-icon
          v-visible="showMyCaseFileIcon(caseFile)"
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
      </div>
    </template>

    <template #[`item.${customColumns.name}`]="{ item: caseFile }">
      <router-link
        v-if="caseFile.householdId"
        class="rc-link14"
        :data-test="`beneficiaryName-link_${caseFile.primaryMemberName}`"
        :to="getHouseholdProfileRoute(caseFile)">
        {{ caseFile.primaryMemberName }}
        <v-icon
          v-if="caseFile.hasPotentialDuplicates"
          :data-test="`caseFilesTable__duplicateIcon--${caseFile.caseFileNumber}`"
          small
          class="ml-1"
          color="secondary">
          $rctech-duplicate
        </v-icon>
      </router-link>
    </template>

    <template #[`item.${customColumns.event}`]="{ item: caseFile }">
      {{ caseFile.eventName }}
    </template>

    <template #[`item.${customColumns.triage}`]="{ item: caseFile }">
      {{ $t(`enums.Triage.${CaseFileTriage[caseFile.entity.triage || CaseFileTriage.None]}`) }}
    </template>

    <template #[`item.${customColumns.status}`]="{ item: caseFile }">
      <status-chip status-name="CaseFileStatus" :status="caseFile.entity.caseFileStatus" />
    </template>

    <template #[`item.${customColumns.created}`]="{ item: caseFile }">
      {{ getLocalStringDate(caseFile.entity.created, 'Entity.created', 'PP') }}
    </template>

    <template #[`item.${customColumns.recentlyViewed}`]="{ item: caseFile }">
      <v-icon v-if="caseFile.recentlyViewed">
        mdi-eye
      </v-icon>
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { DataTableHeader } from 'vuetify';
import { RcDataTable } from '@libs/component-lib/components';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import isEqual from 'lodash/isEqual';
import _throttle from 'lodash/throttle';
import pickBy from 'lodash/pickBy';
import routes from '@/constants/routes';
import { IAzureSearchParams, IAzureTableSearchResults } from '@libs/shared-lib/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import {
  CaseFileStatus, CaseFileTriage, ICaseFileMetadata, IdParams, ICaseFileEntity,
  CaseFileSearchOptimized,
} from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { FilterKey } from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import { useUserStore } from '@/pinia/user/user';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useCaseFileStore, useCaseFileMetadataStore } from '@/pinia/case-file/case-file';
import { useHouseholdStore } from '@/pinia/household/household';
import { TranslateResult } from 'vue-i18n';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { IMemberEntity } from '@libs/entities-lib/src/value-objects/member';
import { usePersonStore } from '@/pinia/person/person';
import { useEventStore } from '@/pinia/event/event';

interface CaseFileSearchOptimizedExtended extends CaseFileSearchOptimized {
  entity: ICaseFileEntity;
  recentlyViewed: boolean;
  primaryMemberName: string;
  eventName: string;
  pinned: boolean;
}

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
      CaseFileTriage,
      FilterKey,
      myCaseFiles: false,
      duplicatesOnly: false,
      recentlyViewedOnly: false,
      getLocalStringDate: helpers.getLocalStringDate,
      helpLink: 'zendesk.help_link.caseFilesTable',
      options: {
        page: 1,
        sortBy: ['SearchItem/Created'],
        sortDesc: [true],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
      combinedCaseFileStore: new CombinedStoreFactory<ICaseFileEntity, ICaseFileMetadata, IdParams>(useCaseFileStore(), useCaseFileMetadataStore()),
      sqlSearchMode: true,
      quicksearchField: 'SearchItem/SearchableText',
      caseFilesFromSearch: [] as CaseFileSearchOptimized[],
    };
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await useCaseFileStore().fetchRecentlyViewed();
  },

  computed: {
    userId():string {
      return useUserStore().getUserId();
    },

    myCaseFilesFilter(): Record<string, unknown> {
      return {
        Entity: {
          AssignedTeamMembersAsString: {
            contains: this.userId,
          },
        },
      };
    },

    duplicatesOnlyFilter(): Record<string, unknown> {
      return {
        'SearchItem/HasPotentialDuplicates': true,
      };
    },

    isRecentlyViewedFilter(): Record<string, unknown> {
      if (useCaseFileStore().recentlyViewedCaseFileIds.length === 0) {
        return {
          Entity: {
            Id: { value: null, type: EFilterKeyType.Guid },
          },
        };
      }
      const recentlyViewedObjectList = useCaseFileStore().recentlyViewedCaseFileIds.map((id) => ({
          Entity: {
            Id: { value: id, type: EFilterKeyType.Guid },
          },
        }));
      return {
          or: recentlyViewedObjectList,
      };
    },

    caseFiles() : Array<CaseFileSearchOptimized & { entity: ICaseFileEntity, pinned: boolean }> {
      const storeCaseFile = this.combinedCaseFileStore.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
      return storeCaseFile.map((c) => {
        const optimized = this.caseFilesFromSearch.find((cs) => c.entity.id === cs.id);
        return {
          id: c.entity.id,
          caseFileNumber: c.entity.caseFileNumber,
          created: c.entity.created,
          eventId: c.entity.eventId,
          eventNameEn: optimized?.eventNameEn,
          eventNameFr: optimized?.eventNameFr,
          hasPotentialDuplicates: c.metadata?.hasPotentialDuplicates != null ? c.metadata.hasPotentialDuplicates : optimized?.hasPotentialDuplicates,
          householdId: c.entity.householdId,
          lastActionDate: optimized?.lastActionDate,
          primaryBeneficiaryFirstName: optimized?.primaryBeneficiaryFirstName,
          primaryBeneficiaryLastName: optimized?.primaryBeneficiaryLastName,
          status: c.entity.status,
          pinned: c.pinned,
          entity: c.entity,
        };
      });
    },

    households(): IHouseholdEntity[] {
      return useHouseholdStore().getByIds(this.caseFiles.map((x) => x.householdId));
    },

    persons(): IMemberEntity[] {
      return usePersonStore().getByIds(this.households.map((x) => x.primaryBeneficiary));
    },

    tableData(): CaseFileSearchOptimizedExtended[] {
      // we fallback on search results when events/persons arent loaded, but once loaded these are used to get the official names
      // in case we get updates from signalr on them
      const parsedData = this.caseFiles.map((d) => {
        const recentlyViewed = useCaseFileStore().recentlyViewedCaseFileIds.indexOf(d.id) > -1;
        return {
          ...d,
          recentlyViewed,
          primaryMemberName: this.getBeneficiaryName(d) as string,
          // eslint-disable-next-line no-nested-ternary
          eventName: useEventStore().getById(d.eventId)?.name
            ? this.$m(useEventStore().getById(d.eventId)?.name) : this.$i18n.locale === 'fr' ? d.eventNameFr : d.eventNameEn,
        };
      });
      return parsedData;
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'SearchItem/CaseFileNumber',
        name: 'SearchItem/PrimaryBeneficiaryFirstName',
        event: `SearchItem/EventName${this.$i18n.locale}`,
        triage: `SearchItem/CaseFile/Metadata/TriageName/Translation/${this.$i18n.locale}`,
        status: `SearchItem/CaseFile/Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
        created: 'SearchItem/Created',
        recentlyViewed: 'RecentlyViewed',
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
        {
          text: this.$t('caseFilesTable.recentlyViewed') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.recentlyViewed,
          width: '5%',
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      const filters = [
        {
          key: 'SearchItem/PrimaryBeneficiaryFirstName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.firstName') as string,
        },
        {
          key: 'SearchItem/PrimaryBeneficiaryLastName',
          type: EFilterType.Text,
          label: this.$t('caseFilesTable.tableHeaders.lastName') as string,
        },
        {
          key: 'SearchItem/EventId',
          keyType: EFilterKeyType.Guid,
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
          key: 'SearchItem/CaseFile/Triage',
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.triage') as string,
          items: helpers.enumToTranslatedCollection(CaseFileTriage, 'enums.Triage', false, true, true),
        },
        {
          key: 'SearchItem/Created',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.createdDate') as string,
        },
        {
          key: 'SearchItem/CaseFile/CaseFileStatus',
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.status') as string,
          items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', false, true, true),
        },
        {
          key: 'SearchItem/HasPotentialDuplicates',
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
          key: 'SearchItem/CaseFile/AssignedTeamMembersAsString',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.isAssigned') as string,
          items: [{
            text: this.$t('common.yes') as string,
            value: 'stringArrayNotEmpty',
          }, {
            text: this.$t('common.no') as string,
            value: 'stringArrayEmpty',
          }],
        },
        {
          key: 'SearchItem/LastActionDate',
          type: EFilterType.Date,
          label: this.$t('caseFileTable.filters.lastActionDate') as string,
        },
      ];

      return filters;
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
        loading: useCaseFileStore().searchLoading,
        itemClass: (item: CaseFileSearchOptimizedExtended) => (item.pinned ? 'pinned' : ''),
      };
    },
  },

  watch: {
    myCaseFiles(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }
      this.applyCustomFilter(newValue, this.myCaseFilesFilter);
    },

    households() {
      this.fetchPersonsAndEvents();
    },

    duplicatesOnly(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }
      this.applyCustomFilter(newValue, this.duplicatesOnlyFilter);
    },

    recentlyViewedOnly(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }
        this.applyCustomFilter(newValue, this.isRecentlyViewedFilter);
    },
  },

  methods: {
    fetchPersonsAndEvents: _throttle(async function func(this: { households: IHouseholdEntity[], caseFiles: CaseFileSearchOptimized[] }) {
      useEventStore().fetchByIds(this.caseFiles.map((x) => x.eventId), true);
      usePersonStore().fetchByIds(this.households.map((x) => x.primaryBeneficiary), true);
    }, 100),

    applyCustomFilter(value: boolean, filter: Record<string, unknown>) {
      let preparedFilters = {} as Record<string, unknown>;

      if (value) {
        // We apply filters from the switch + the ones from the filters panel
        preparedFilters = { ...this.userFilters, ...filter };
      } else if (isEqual(filter, this.userFilters)) { // If the only filter is myCaseFile
        preparedFilters = null;
      } else {
        const filterValue = Object.values(filter)[0];
        preparedFilters = pickBy(this.userFilters, (value) => !isEqual(filterValue, value)); // Only the other filters
      }

      this.onApplyFilter({ preparedFilters, searchFilters: this.userSearchFilters }, this.filterState);
    },

    additionalFilters() {
      return {
        myCaseFilesFilter: this.myCaseFiles,
        duplicatesOnlyFilter: this.duplicatesOnly,
        isRecentlyViewedFilter: this.recentlyViewedOnly,
      };
    },

    setAdditionalFilters(state: unknown) {
      // eslint-disable-next-line
      this.myCaseFiles = (state as any)?.myCaseFilesFilter || false;
      this.duplicatesOnly = (state as any)?.duplicatesOnlyFilter || false;
      this.recentlyViewedOnly = (state as any)?.isRecentlyViewedFilter || false;
    },

    async fetchData(params: IAzureSearchParams): Promise<IAzureTableSearchResults> {
      const res = await this.$services.caseFiles.searchOptimized({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, true);

      const ids = res.value.map((x) => x.searchItem.id);
      this.caseFilesFromSearch = res.value.map((x) => x.searchItem);

      useCaseFileStore().setAll(res.value.map((x) => x.entity));

      const casefiles = this.combinedCaseFileStore.getByIds(ids, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
      useHouseholdStore().fetchByIds(casefiles.map((x) => x.entity.householdId), true);
      return {
        count: res.odataCount,
        ids,
        date: new Date(),
      };
    },

    getBeneficiaryName(caseFile: CaseFileSearchOptimized): string | TranslateResult {
      const household = this.households.find((h) => h.id === caseFile?.householdId);

      if (!household) {
        return `${caseFile?.primaryBeneficiaryFirstName} ${caseFile?.primaryBeneficiaryLastName}`;
      }

      if (!household.primaryBeneficiary) {
        return this.$t('caseFilesTable.tableContent.empty_household');
      }
      const identitySet = this.persons.find((p) => household.primaryBeneficiary === p.id)?.identitySet;
      if (!identitySet) {
        return `${caseFile?.primaryBeneficiaryFirstName} ${caseFile?.primaryBeneficiaryLastName}`;
      }
      return `${identitySet?.firstName} ${identitySet?.lastName}`;
    },

    getHouseholdProfileRoute(caseFile: CaseFileSearchOptimized) {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: caseFile.householdId,
        },
      };
    },

    getCaseFileRoute(caseFile: CaseFileSearchOptimized) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: caseFile.id,
        },
      };
    },

    async onApplyFilterLocal({ preparedFilters, searchFilters }
    : { preparedFilters: Record<string, unknown>, searchFilters: string }, filterState: unknown) {
      let finalFilters = preparedFilters;

      if (this.myCaseFiles) {
        finalFilters = { ...finalFilters, ...this.myCaseFilesFilter };
      }

      if (this.duplicatesOnly) {
        finalFilters = { ...finalFilters, ...this.duplicatesOnlyFilter };
      }

      if (this.recentlyViewedOnly) {
        finalFilters = { ...finalFilters, ...this.isRecentlyViewedFilter };
      }

      await this.onApplyFilter({ preparedFilters: finalFilters, searchFilters }, filterState);
    },

    showMyCaseFileIcon(caseFile: CaseFileSearchOptimizedExtended): boolean {
      if (!caseFile.entity?.assignedTeamMembers?.length) {
        return false;
      }
      return caseFile.entity.assignedTeamMembers.some((tm) => tm.teamMembersIds?.includes(this.userId));
    },

    getTableName():string {
      return 'case-files';
    },
  },

});
</script>
