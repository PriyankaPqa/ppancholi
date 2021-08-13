<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :labels="labels"
      :table-props="tableProps"
      :show-add-button="$hasLevel('level6')"
      :options.sync="options"
      :custom-columns="[
        customColumns.name,
        customColumns.dateCreated,
        customColumns.projected,
        customColumns.successful,
        customColumns.status,
        'deleteButton'
      ]"
      @add-button="goToAdd"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link class="rc-link14 font-weight-bold" data-test="massAction-name" :to="goToDetails(item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.dateCreated}`]="{ item }">
        {{ moment(item.entity.created).local().format('ll') }}
      </template>

      <template #[`item.${customColumns.projected}`]="{ item }">
        {{ isPreprocessing(item) ? $t('common.toBeDetermined') : getLastRunMetadata(item) && getLastRunMetadata(item).results.total }}
      </template>

      <template #[`item.${customColumns.successful}`]="{ item }">
        {{ isPreprocessing(item) ? $t('common.toBeDetermined') : getLastRunMetadata(item) && getLastRunMetadata(item).results.successes }}
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="MassActionRunStatus" :status="getLastRunEntity(item).runStatus" />
      </template>

      <template #[`item.deleteButton`]="{ item }">
        <v-btn v-if="showDeleteIcon(item)" icon class="mr-2" data-test="delete" @click="deleteItem(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { DataTableHeader } from 'vuetify';
import { RcDataTable } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import moment from 'moment';
import _orderBy from 'lodash/orderBy';
import {
  IMassActionCombined, IMassActionRun, IMassActionRunMetadataModel, MassActionRunStatus,
} from '@/entities/mass-action';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@/types';
import { IAzureTableSearchResults } from '@/types/interfaces/IAzureSearchResult';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'ImportValidationStatusHome',

  components: {
    RcDataTable,
    StatusChip,
  },

  data() {
    return {
      itemsCount: 0,
      searchResultIds: [] as string[],
      moment,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        dateCreated: 'Entity/Created',
        projected: 'Metadata/LastRun/Results/Total',
        successful: 'Metadata/LastRun/Results/Successes',
        status: 'Metadata/LastRun/RunStatus',
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t('massAction.impactValidationStatusTable.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    headers(): Array<DataTableHeader> {
      return [{
        text: this.$t('massAction.common.name') as string,
        align: 'start',
        sortable: true,
        value: this.customColumns.name,
        width: '50%',
      }, {
        text: this.$t('massAction.common.dateCreated') as string,
        value: this.customColumns.dateCreated,
        sortable: true,
      }, {
        text: this.$t('massAction.common.projected') as string,
        value: this.customColumns.projected,
        sortable: true,
      }, {
        text: this.$t('massAction.common.successful') as string,
        value: this.customColumns.successful,
        sortable: true,
      }, {
        text: this.$t('massAction.common.status') as string,
        value: this.customColumns.status,
        sortable: false,
      }, {
        align: 'end',
        text: '',
        value: 'deleteButton',
        sortable: false,
      }];
    },

    tableData(): IMassActionCombined[] {
      return this.$storage.massAction.getters.getByIds(this.searchResultIds);
    },

    tableProps(): Record<string, string> {
      return {
        loading: this.$store.state.massActionEntities.searchLoading,
      };
    },

  },

  methods: {
    goToAdd() {
      this.$router.push({ name: routes.massActions.importValidationStatus.create.name });
    },

    goToDetails(id: string) {
      return {
        name: routes.massActions.importValidationStatus.details.name,
        params: {
          id,
        },
      };
    },

    deleteItem() {
      return false;
    },

    getLastRunEntity(massAction: IMassActionCombined): IMassActionRun {
      return _orderBy(massAction.entity.runs, 'timestamp', 'desc')[0];
    },

    getLastRunMetadata(massAction: IMassActionCombined): IMassActionRunMetadataModel {
      return massAction?.metadata.lastRun;
    },

    isPreprocessing(massAction: IMassActionCombined) {
      return this.getLastRunEntity(massAction).runStatus === MassActionRunStatus.PreProcessing;
    },

    isPreprocessed(massAction: IMassActionCombined) {
      return this.getLastRunEntity(massAction).runStatus === MassActionRunStatus.PreProcessed;
    },

    showDeleteIcon(massAction: IMassActionCombined) {
      return this.isPreprocessing(massAction) || this.isPreprocessed(massAction);
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.massAction.actions.search({
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
      return res;
    },

    setResults(res: IAzureTableSearchResults) {
      this.itemsCount = res.count;
      this.searchResultIds = res.ids;
    },
  },
});
</script>

<style lang="scss" scoped>

</style>
