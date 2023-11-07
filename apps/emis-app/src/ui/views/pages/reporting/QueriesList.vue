<template>
  <div class="pa-4">
    <rc-data-table
      data-test="queries-table"
      :items="queryItems"
      :count="queryItems.length"
      :labels="labels"
      :headers="headers"
      :hide-footer="true"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      :show-add-button="canAdd"
      @add-button="addQuery"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="queryDetail-link"
          :to="getQueryRoute(item.id)">
          {{ item.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.theme}`]="{ item }">
        {{ item.theme }}
      </template>

      <template #[`item.${customColumns.sharedBy}`]="{ item }">
        {{ item.sharedBy }}
      </template>

      <template #[`item.${customColumns.delete}`]="{ item }">
        <v-btn icon data-test="deleteQuery-link" @click="deleteQuery(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>

    <rc-dialog
      v-if="showThemePicker"
      data-test="theme-dialog"
      :title="$t('reporting.query.selectTheme')"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="$t('common.buttons.create')"
      :show.sync="showThemePicker"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="600"
      @cancel="showThemePicker = false;"
      @close="showThemePicker = false;"
      @submit="submitAddQuery()">
      <div data-test="theme-dialog-content" class="px-2">
        <p class="rc-body14 my-2">
          {{ $t('reporting.query.themeTitle') }}
        </p>
        <div>
          <v-text-field
            v-model="searchTheme"
            clearable
            outlined
            prepend-inner-icon="mdi-magnify"
            data-test="search-input"
            :placeholder="$t('common.search')" />
        </div>
        <v-sheet class="overflow-y-auto" max-height="330" outlined rounded>
          <v-radio-group v-model="selectedTheme" class="pa-0 ma-0 theme-radio-group" mandatory>
            <v-sheet v-for="(item) in availableThemes" :key="item.id" outlined>
              <v-radio :value="item.id" class="pa-4 ma-0 theme-radio">
                <template #label>
                  <div class="px-4 rc-body14">
                    <div class="fw-bold">
                      {{ item.name }}
                    </div>
                    <div>{{ item.description }}</div>
                  </div>
                </template>
              </v-radio>
            </v-sheet>
          </v-radio-group>
        </v-sheet>
      </div>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import _orderBy from 'lodash/orderBy';
import { DataTableHeader } from 'vuetify';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { RcDataTable, RcDialog } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { useUserStore } from '@/pinia/user/user';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import {
  QueryType, ReportingTopic,
} from '@libs/entities-lib/reporting';
import { IdParams, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';

import routes from '@/constants/routes';

import { AllReports } from './standard_queries';

interface IQueryMapped {
  name: string;
  id: string;
  theme: string;
  sharedBy: string;
  pinned?: boolean;
}

export default mixins(TablePaginationSearchMixin).extend({
  name: 'QueriesList',

  components: {
    RcDataTable,
    RcDialog,
  },

  props: {
    queryTypeName: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      options: {
        sortBy: ['name'],
        sortDesc: [false],
      },
      tableProps: {
        itemClass: (item: { pinned: boolean }) => (item.pinned ? 'pinned' : ''),
      },
      items: [] as IQueryMapped[],
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
      showThemePicker: false,
      searchTheme: '',
      selectedTheme: null as ReportingTopic,
    };
  },

  computed: {
    queryType(): QueryType {
      if (this.queryTypeName === 'Custom') {
        return QueryType.Custom;
      }
      return QueryType[this.queryTypeName + this.$i18n.locale as any] as any;
    },

    canAdd(): boolean {
      return this.queryType === QueryType.Custom;
    },

    canDelete(): boolean {
      return this.queryType === QueryType.Custom;
    },

    standardReports(): IQueryMapped[] {
      if (this.queryType === QueryType.Custom) {
        return null;
      }
      const reports = AllReports.filter((r) => r.queryType === this.queryType);
      return reports.map((q) => ({
        id: q.id,
        theme: this.$t(`reporting.query.theme.${ReportingTopic[q.topic]}`) as string,
        name: q.name,
        sharedBy: '',
      }));
    },

    queryItems(): IQueryMapped[] {
      const items = sharedHelpers.filterCollectionByValue(
        this.standardReports || this.items,
        this.params?.search,
      );
      return _orderBy(items, ['pinned', ((item) => item[this.options.sortBy[0]]?.toLowerCase())], ['desc', this.options.sortDesc[0] ? 'desc' : 'asc']);
    },

    customColumns(): Record<string, string> {
      return {
        name: 'name',
        theme: 'theme',
        sharedBy: 'sharedBy',
        delete: 'delete',
      };
    },

    headers(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
          width: '60%',
        },
        {
          text: this.$t('reporting.query.theme') as string,
          sortable: true,
          value: this.customColumns.theme,
        },
      ];

      if (this.queryType === QueryType.Custom) {
        headers.push({
          text: this.$t('reporting.query.sharedBy') as string,
          sortable: true,
          value: this.customColumns.sharedBy,
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

    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t(`reporting.query.title.${QueryType[this.queryType]}`)} (${this.queryItems.length})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('reporting.query.add.title'),
        },
      };
    },

    availableThemes(): { name: string, description: string, id: ReportingTopic }[] {
      const themes = sharedHelpers.filterCollectionByValue([
        {
          id: ReportingTopic.HouseholdMembers,
          name: this.$t('reporting.query.theme.HouseholdMembers'),
          description: this.$t('reporting.query.theme.HouseholdMembers.description'),
        },
        {
          id: ReportingTopic.HouseholdPrimary,
          name: this.$t('reporting.query.theme.HouseholdPrimary'),
          description: this.$t('reporting.query.theme.HouseholdPrimary.description'),
        },
        {
          id: ReportingTopic.CaseFileActivities,
          name: this.$t('reporting.query.theme.CaseFileActivities'),
          description: this.$t('reporting.query.theme.CaseFileActivities.description'),
        },
        {
          id: ReportingTopic.PaymentLine,
          name: this.$t('reporting.query.theme.PaymentLine'),
          description: this.$t('reporting.query.theme.PaymentLine.description'),
        },
        {
          id: ReportingTopic.PaymentGroup,
          name: this.$t('reporting.query.theme.PaymentGroup'),
          description: this.$t('reporting.query.theme.PaymentGroup.description'),
        },
        {
          id: ReportingTopic.Referrals,
          name: this.$t('reporting.query.theme.Referrals'),
          description: this.$t('reporting.query.theme.Referrals.description'),
        },
        {
          id: ReportingTopic.UsersInTeams,
          name: this.$t('reporting.query.theme.UsersInTeams'),
          description: this.$t('reporting.query.theme.UsersInTeams.description'),
        },
      ], this.searchTheme);

      return _orderBy(themes, ['name'], ['asc']);
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    if (this.queryType === QueryType.Custom) {
      await this.loadData();
    }
  },

  methods: {
    async loadData() {
      const res = await this.$services.queries.fetchByType(this.queryType);
      const userIds = [...new Set(res.map((x) => x.createdBy).filter((u) => u !== useUserStore().getUserId() && u))];
      if (userIds.length) {
        await sharedHelpers.callSearchInInBatches({
          ids: userIds,
          service: this.combinedUserAccountStore,
          searchInFilter: { Entity: { Id: { searchIn_az: '{ids}' } } },
          otherOptions: {
            queryType: 'full',
            searchMode: 'all',
          },
        });
      }
      const users = useUserAccountMetadataStore().getByIds(userIds);

      this.items = res.map((q) => ({
        id: q.id,
        theme: this.$t(`reporting.query.theme.${ReportingTopic[q.topic]}`) as string,
        name: q.name,
        sharedBy: users.find((u) => u.id === q.createdBy)?.displayName,
      }));
    },

    async fetchData() {
      return this.queryItems;
    },

    addQuery() {
      this.showThemePicker = true;
    },

    submitAddQuery() {
      this.showThemePicker = false;

      this.$router.push({
        name: routes.reporting.newQuery.name,
        params: {
          theme: this.selectedTheme.toString(),
        },
      });
    },

    async deleteQuery(item: IQueryMapped) {
      const userChoice = await this.$confirm({
        title: this.$t('reporting.query.confirm.delete.title'),
        messages: this.$t('reporting.query.confirm.delete.message'),
      });

      if (userChoice) {
        await this.$services.queries.deactivate(item.id);
        this.items = this.items.filter((q) => q !== item);
      }
    },

    getQueryRoute(id: string) {
      return {
        name: routes.reporting.query.name,
        params: {
          queryId: id,
        },
      };
    },
  },
});
</script>
<style scoped lang="scss">
  .theme-radio {
    flex-direction: row-reverse;
  }
  .theme-radio-group {
    ::v-deep .v-input__slot {
      margin-bottom: 0;
    }
  }
</style>
