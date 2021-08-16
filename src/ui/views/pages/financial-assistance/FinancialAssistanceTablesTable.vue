<template>
  <rc-data-table
    data-test="fa-templates-table"
    :items="tableData"
    :count="count"
    :labels="labels"
    :headers="headers"
    sort-by="createdDate"
    sort-desc
    :table-props="tableProps"
    show-help
    :help-link="$t('zendesk.help_link.financial_assistance_tables_list')"
    :options.sync="options"
    :custom-columns="[
      customColumns.program,
      customColumns.name,
      customColumns.status,
      'editButton'
    ]"
    @search="search">
    <template v-if="$hasLevel('level6')" #headerLeft>
      <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="onClickMenuItem($event)" />
    </template>

    <template #[`item.${customColumns.program}`]="{ item }">
      {{ $m(item.metadata.programName) }}
    </template>

    <template #[`item.${customColumns.name}`]="{ item }">
      <router-link
        class="rc-link14 font-weight-bold"
        data-test="eventDetail-link"
        :to="getDetailsRoute(item)">
        {{ $m(item.entity.name) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.status}`]="{ item }">
      <status-chip status-name="Status" :status="item.entity.status" />
    </template>

    <template #[`item.editButton`]="{ item }">
      <v-btn icon class="mr-2" data-test="edit_financial_assistance" @click="goToEdit(item)">
        <v-icon size="24" color="grey darken-2">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDataTable, RcAddButtonWithMenu } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import { DataTableHeader } from 'vuetify';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@/types';
import { IAzureTableSearchResults } from '@/types/interfaces/IAzureSearchResult';
import { IFinancialAssistanceTableCombined } from '@/entities/financial-assistance';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'FinancialAssistanceTablesTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  data() {
    return {
      count: 0,
      searchResultIds: [] as string[],
      options: {
        page: 1,
        sortBy: [`Metadata/FinancialAssistanceTableStatusName/Translation/${this.$i18n.locale}`],
        sortDesc: [false],
      },
    };
  },

  computed: {
    labels(): Record<string, Record<string, TranslateResult>> {
      return {
        header: {
          title: this.$t('financialAssistance.table.title.table'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    headers(): Array<DataTableHeader> {
      return [{
        text: this.$t('financialAssistance.program') as string,
        align: 'start',
        sortable: true,
        value: this.customColumns.program,
      }, {
        text: this.$t('common.name') as string,
        value: this.customColumns.name,
        width: '60%',
        sortable: true,
      }, {
        text: this.$t('common.status') as string,
        value: this.customColumns.status,
        sortable: true,
      }, {
        align: 'end',
        text: '',
        value: 'editButton',
        sortable: false,
      }];
    },

    customColumns(): Record<string, string> {
      return {
        program: `Metadata/ProgramName/Translation/${this.$i18n.locale}`,
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: `Metadata/FinancialAssistanceTableStatusName/Translation/${this.$i18n.locale}`,
      };
    },

    tableData(): IFinancialAssistanceTableCombined[] {
      return this.$storage.financialAssistance.getters.getByIds(this.searchResultIds);
    },

    tableProps(): Record<string, string> {
      return {
        loading: this.$store.state.financialAssistanceEntities.searchLoading,
      };
    },

    menuItems(): Array<Record<string, string>> {
      return [
        {
          text: this.$t('financialAssistance.createNewTable') as string,
          value: 'new',
          icon: 'mdi-file',
          dataTest: 'financialAssistanceTables__createNew',
        },
        // {
        //   text: this.$t('financialAssistance.createTableFromExisting') as string,
        //   value: 'copy',
        //   icon: 'mdi-file-multiple',
        //   dataTest: 'financialAssistanceTables__copyExisting',
        // },
      ];
    },

    eventId(): string {
      return this.$route.params.id;
    },
  },
  methods: {
    async fetchData(params: IAzureSearchParams) {
      params.filter = {
        'Entity/EventId': this.eventId,
      };

      const res = await this.$storage.financialAssistance.actions.search({
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
      this.count = res.count;
      this.searchResultIds = res.ids;
    },

    onClickMenuItem(item: Record<string, string>) {
      if (item.value === 'new') {
        this.$router.push({
          name: routes.events.financialAssistance.create.name,
        });
      }
    },

    goToEdit(item: IFinancialAssistanceTableCombined) {
      this.$router.push({
        name: routes.events.financialAssistance.edit.name,
        params: { faId: item.entity.id },
      });
    },

    getDetailsRoute(item: IFinancialAssistanceTableCombined) {
      return {
        name: routes.events.financialAssistance.details.name,
        params: {
          faId: item.entity.id,
        },
      };
    },
  },
});
</script>
