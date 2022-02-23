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
        {{ (item.metadata && $m(item.metadata.referralTypeName)) || '-' }}
      </template>

      <template #[`item.${customColumns.outcomeStatus}`]="{ item }">
        {{ (item.metadata && $m(item.metadata.referralOutcomeStatusName) || '-') }}
      </template>

      <template v-if="canEdit" #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon :to="getReferralEditRoute(item.entity.id)" data-test="editReferral-link">
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
  RcDataTable, IFilterSettings,
} from '@crctech/component-library';
import { EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@/types';
import routes from '@/constants/routes';
import { IOptionItem } from '@/entities/optionItem';
import { FilterKey } from '@/entities/user-account';
import { ICaseFileReferralCombined } from '@/entities/case-file-referral';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
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
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        refType: `Metadata/ReferralTypeName/Translation/${this.$i18n.locale}`,
        outcomeStatus: `Metadata/ReferralOutcomeStatusName/Translation/${this.$i18n.locale}`,
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
          text: '',
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
          key: 'Metadata/ReferralOutcomeStatusId',
          type: EFilterType.MultiSelect,
          label: this.$t('caseFile.referral.outcomeStatus') as string,
          items: this.outcomeStatuses.map((s) => ({ text: this.$m(s.name), value: s.id })).concat([{ text: '-', value: null }]),
        },
      ];
    },

    referralTypes(): Array<IOptionItem> {
      return this.$storage.caseFileReferral.getters.types(false, null);
    },

    outcomeStatuses(): Array<IOptionItem> {
      return this.$storage.caseFileReferral.getters.outcomeStatuses(false, null);
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.caseReferralEntities.searchLoading,
        itemClass: (item: ICaseFileReferralCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): ICaseFileReferralCombined[] {
      return this.$storage.caseFileReferral.getters.getByIds(this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId } });
    },

  },

  async created() {
    this.saveState = true;
    this.loadState();
    await this.$storage.caseFileReferral.actions.fetchTypes();
    await this.$storage.caseFileReferral.actions.fetchOutcomeStatuses();
  },

  methods: {
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
      const res = await this.$storage.caseFileReferral.actions.search({
        search: params.search,
        filter: { 'Entity/CaseFileId': this.$route.params.id, ...filterParams },
        top: 1000,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
    },
  },
});
</script>
