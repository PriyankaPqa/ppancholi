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

      <template #[`item.${customColumns.category}`]="{ item }">
        {{ item.category }}
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
  </div>
</template>

<script lang="ts">
import _orderBy from 'lodash/orderBy';
import { DataTableHeader } from 'vuetify';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { RcDataTable } from '@libs/component-lib/components';
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

interface IQueryMapped {
  name: string;
  id: string;
  category: string;
  sharedBy: string;
  pinned?: boolean;
}

export default mixins(TablePaginationSearchMixin).extend({
  name: 'QueriesList',

  components: {
    RcDataTable,
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

    queryItems(): IQueryMapped[] {
      const items = sharedHelpers.filterCollectionByValue(
        this.items,
        this.params?.search,
      );
      return _orderBy(items, ['pinned', this.options.sortBy[0]], ['desc', this.options.sortDesc[0] ? 'desc' : 'asc']);
    },

    customColumns(): Record<string, string> {
      return {
        name: 'name',
        category: 'category',
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
          text: this.$t('reporting.query.category') as string,
          sortable: true,
          value: this.customColumns.category,
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
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await this.loadData();
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
        category: this.$t(`reporting.query.category.${ReportingTopic[q.topic]}`) as string,
        name: q.name,
        sharedBy: users.find((u) => u.id === q.createdBy)?.displayName,
      }));
    },

    async fetchData() {
      return this.queryItems;
    },

    addQuery() {
      // this.$router.push({
      //   name: routes.caseFile.documents.add.name,
      // });
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
