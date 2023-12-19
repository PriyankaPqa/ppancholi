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
              :aria-label="$t('caseFilesTable.myCaseFiles')"
              hide-details />
            <v-icon class="mr-2">
              mdi-account-check
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.myCaseFiles') }}
            </span>
          </div>
          <template v-if="$hasFeature(FeatureKeys.ManageDuplicates)">
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
          </template>
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
        <v-icon
          v-if="!$hasFeature(FeatureKeys.ManageDuplicates) && caseFile.entity.isDuplicate"
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
        <v-icon
          v-if="$hasFeature(FeatureKeys.ManageDuplicates) && caseFile.metadata.hasPotentialDuplicates"
          :data-test="`caseFilesTable__duplicateIcon--${caseFile.entity.caseFileNumber}`"
          small
          class="ml-1"
          color="secondary">
          $rctech-duplicate
        </v-icon>
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
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import {
  ICaseFileCombined, CaseFileStatus, CaseFileTriage, ICaseFileMetadata, IdParams, ICaseFileEntity } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { FilterKey } from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import { useUserStore } from '@/pinia/user/user';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useCaseFileStore, useCaseFileMetadataStore } from '@/pinia/case-file/case-file';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { TranslateResult } from 'vue-i18n';

interface IParsedCaseFileCombined extends ICaseFileCombined {
  recentlyViewed: boolean;
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
      FilterKey,
      FeatureKeys,
      myCaseFiles: false,
      duplicatesOnly: false,
      recentlyViewedOnly: false,
      getLocalStringDate: helpers.getLocalStringDate,
      helpLink: 'zendesk.help_link.caseFilesTable',
      searchEventsResultIds: [] as string[],
      searchEventMethod: 'searchMyEvents',
      options: {
        page: 1,
        sortBy: ['Entity/Created'],
        sortDesc: [true],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
      combinedCaseFileStore: new CombinedStoreFactory<ICaseFileEntity, ICaseFileMetadata, IdParams>(useCaseFileStore(), useCaseFileMetadataStore()),
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
          AssignedTeamMembers: {
            any: {
              TeamMembersIds: {
                any: {
                  [ITEM_ROOT]: this.userId,
                },
              },
            },
          },
        },
      };
    },

    duplicatesOnlyFilter(): Record<string, unknown> {
      return {
        'Metadata/HasPotentialDuplicates': true,
      };
    },

    isRecentlyViewedFilter(): Record<string, unknown> {
      if (useCaseFileStore().recentlyViewedCaseFileIds.length === 0) {
        return {
          Entity: {
            Id: '',
          },
        };
      }
      const recentlyViewedObjectList = useCaseFileStore().recentlyViewedCaseFileIds.map((id) => ({
          Entity: {
            Id: id,
          },
        }));
      return {
          or: recentlyViewedObjectList,
      };
    },

    tableData(): IParsedCaseFileCombined[] {
      const rawData = this.combinedCaseFileStore.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
      const parsedData: IParsedCaseFileCombined[] = rawData.map((d) => {
        const recentlyViewed = useCaseFileStore().recentlyViewedCaseFileIds.indexOf(d.entity.id) > -1;
        return {
          ...d,
          recentlyViewed,
        };
      });
      return parsedData;
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Entity/CaseFileNumber',
        name: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
        event: `Metadata/Event/Name/Translation/${this.$i18n.locale}`,
        triage: `Metadata/TriageName/Translation/${this.$i18n.locale}`,
        status: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
        created: 'Entity/Created',
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
          text: '',
          sortable: false,
          value: this.customColumns.recentlyViewed,
          width: '5%',
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      const filters = [
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
          key: 'Entity/AssignedTeamMembers',
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

      return this.$hasFeature(FeatureKeys.ManageDuplicates) ? filters.filter((f) => f.key !== 'Entity/IsDuplicate') : filters;
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
        itemClass: (item: ICaseFileCombined) => (item.pinned ? 'pinned' : ''),
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

    async fetchData(params: IAzureSearchParams) {
      const res = await this.combinedCaseFileStore.search({
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

    getBeneficiaryName(caseFile: ICaseFileCombined): string | TranslateResult {
      if (!caseFile?.metadata?.primaryBeneficiary?.identitySet) {
        return this.$t('caseFilesTable.tableContent.empty_household');
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

    showMyCaseFileIcon(caseFile:ICaseFileCombined): boolean {
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
