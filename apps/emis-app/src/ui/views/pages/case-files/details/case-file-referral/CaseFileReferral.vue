<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-referrals-table"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :show-help="false"
      :help-link="$t('zendesk.help_link.case_referral_list')"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canEdit"
      @add-button="addCaseReferral"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Referrals"
          :count="itemsCount"
          :initial-filter="filterState"
          :filter-options="filters"
          :sql-mode="true"
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="referralDetail-link"
          :to="getReferralDetailsRoute(item.entity.id)">
          {{ (item.entity && item.entity.name) || '-' }}
        </router-link>
      </template>

      <template #[`item.${customColumns.refType}`]="{ item }">
        {{ getReferralType(item.entity) }}
      </template>

      <template #[`item.${customColumns.outcomeStatus}`]="{ item }">
        {{ getOutcome(item.entity) }}
      </template>

      <template v-if="canEdit" #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon :to="getReferralEditRoute(item.entity.id)" :aria-label="$t('common.edit')" data-test="editReferral-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@libs/component-lib/components';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { FilterKey } from '@libs/entities-lib/user-account';
import { ICaseFileReferralCombined, ICaseFileReferralEntity, IdParams } from '@libs/entities-lib/case-file-referral';
import { UserRoles } from '@libs/entities-lib/user';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import caseFileDetail from '../caseFileDetail';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'CaseFileReferral',

  components: {
    RcDataTable,
    FilterToolbar,
  },

  data() {
    return {
      FilterKey,
      options: {
        sortBy: ['Entity/Name'],
        sortDesc: [false],
      },
      combinedCaseFileReferralStore: new CombinedStoreFactory<ICaseFileReferralEntity, null, IdParams>(
        useCaseFileReferralStore(),
      ),
      sqlSearchMode: true,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        refType: `Metadata/ReferralType/Translation/${this.$i18n.locale}`,
        outcomeStatus: `Metadata/ReferralOutcomeStatus/Translation/${this.$i18n.locale}`,
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('caseFile.referral.referralType') as string,
          sortable: true,
          value: this.customColumns.refType,
        },
        {
          text: this.$t('caseFile.referral.outcomeStatus') as string,
          sortable: true,
          value: this.customColumns.outcomeStatus,
        },
        {
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('caseFile.referral.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('caseFile.referral.addNewReferral'),
        },
      };
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: this.customColumns.name,
          type: EFilterType.Text,
          label: this.$t('common.name') as string,
        },
        {
          key: this.customColumns.refType,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFile.referral.referralType') as string,
          items: this.referralTypes.map((t) => ({ text: this.$m(t.name), value: this.$m(t.name) })),
        },
        {
          key: 'Metadata/ReferralOutcomeStatus/Id',
          type: EFilterType.MultiSelect,
          keyType: EFilterKeyType.Guid,
          label: this.$t('caseFile.referral.outcomeStatus') as string,
          items: this.outcomeStatuses.map((s) => ({ text: this.$m(s.name), value: s.id })).concat([{ text: '-', value: null }]),
        },
      ];
    },

    referralTypes(): Array<IOptionItem> {
      return useCaseFileReferralStore().getAllTypes(false, null);
    },

    outcomeStatuses(): Array<IOptionItem> {
      return useCaseFileReferralStore().getAllOutcomeStatuses(false, null);
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useCaseFileReferralStore().searchLoading,
        itemClass: (item: ICaseFileReferralCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): ICaseFileReferralCombined[] {
      return this.combinedCaseFileReferralStore.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId } },
      );
    },

  },

  async created() {
    this.saveState = true;
    this.loadState();
    await useCaseFileReferralStore().fetchTypes();
    await useCaseFileReferralStore().fetchOutcomeStatuses();
  },

  methods: {
    getReferralType(item: ICaseFileReferralEntity) {
      return this.$m(this.referralTypes.find((x) => x.id === item.type?.optionItemId)?.name) || '-';
    },

    getOutcome(item: ICaseFileReferralEntity) {
      return this.$m(this.outcomeStatuses.find((x) => x.id === item.outcomeStatus?.optionItemId)?.name) || '-';
    },

    addCaseReferral() {
      this.$router.push({
        name: routes.caseFile.referrals.add.name,
      });
    },

    getReferralDetailsRoute(id: string) {
      return {
        name: routes.caseFile.referrals.details.name,
        params: {
          referralId: id,
        },
      };
    },

    getReferralEditRoute(id: string) {
      return {
        name: routes.caseFile.referrals.edit.name,
        params: {
          referralId: id,
        },
      };
    },

    async fetchData(params: IAzureSearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await this.combinedCaseFileReferralStore.search({
        search: params.search,
        filter: { 'Entity/CaseFileId': { value: this.$route.params.id, type: EFilterKeyType.Guid }, ...filterParams },
        top: 1000,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, false, true);
      return res;
    },
  },
});
</script>
