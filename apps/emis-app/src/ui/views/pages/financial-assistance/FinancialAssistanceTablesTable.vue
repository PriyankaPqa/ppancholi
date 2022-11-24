<template>
  <rc-data-table
    data-test="fa-templates-table"
    :items="tableData"
    :count="itemsCount"
    :labels="labels"
    :headers="headers"
    :footer-text="footerText"
    :table-props="tableProps"
    :show-help="false"
    :help-link="$t('zendesk.help_link.financial_assistance_tables_list')"
    :options.sync="options"
    :initial-search="params && params.search"
    :custom-columns="[
      customColumns.program,
      customColumns.name,
      customColumns.status,
      'editButton',
    ]"
    @search="search">
    <template v-if="$hasLevel('level6')" #headerLeft>
      <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="onClickMenuItem($event)" />
    </template>

    <template #filter>
      <filter-toolbar
        :filter-key="FilterKey.FinancialAssistanceTables"
        :filter-options="filters"
        :count="itemsCount"
        :initial-filter="filterState"
        add-filter-label="financialAssistance.filter"
        @update:appliedFilter="onApplyFilter" />
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
      <v-btn
        icon
        class="mr-2"
        :data-test="`edit_financial_assistance_${ $m(item.entity.name) }`"
        @click="goToEdit(item)">
        <v-icon size="24" color="grey darken-2">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDataTable, RcAddButtonWithMenu } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { DataTableHeader } from 'vuetify';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import _isEmpty from 'lodash/isEmpty';
import { FilterKey } from '@libs/entities-lib/user-account';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import { IFinancialAssistanceTableCombined } from '@libs/entities-lib/financial-assistance';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { IProgramEntity, IProgramMetadata } from '@libs/entities-lib/program';
import { IEntityCombined, Status } from '@libs/entities-lib/base';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'FinancialAssistanceTablesTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
    FilterToolbar,
  },

  data() {
    return {
      FilterKey,
      options: {
        page: 1,
        sortBy: [`Metadata/FinancialAssistanceTableStatusName/Translation/${this.$i18n.locale}`],
        sortDesc: [false],
      },
      programs: [],
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

    filters(): Array<IFilterSettings> {
      return [{
        key: this.customColumns.program,
        type: EFilterType.MultiSelect,
        label: this.$t('financialAssistance.program') as string,
        items: this.programs.map((p: IProgramEntity) => ({
          value: this.$m(p.name),
          text: this.$m(p.name),
        })),
      }, {
        key: this.customColumns.name,
        type: EFilterType.Text,
        label: this.$t('common.name') as string,
      }, {
        key: this.customColumns.status,
        type: EFilterType.MultiSelect,
        label: this.$t('common.status') as string,
        items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
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
      return this.$storage.financialAssistance.getters.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { eventId: this.eventId } },
      );
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.financialAssistanceEntities.searchLoading,
        itemClass: (item: IFinancialAssistanceTableCombined) => (item.pinned ? 'pinned' : ''),
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

    presetFilter(): Record<string, unknown> {
      return {
        'Entity/EventId': this.eventId,
      };
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await this.fetchPrograms();
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      if (_isEmpty(params.filter)) {
        params.filter = this.presetFilter;
      }
      const res = await this.$storage.financialAssistance.actions.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);

      return res;
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

    async fetchPrograms() {
      const res = await this.$storage.program.actions.search({
        filter: this.presetFilter,
        count: true,
        queryType: 'full',
        searchMode: 'all',
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      }, null, true);

      this.programs = this.$storage.program.getters.getByIds(res.ids)
        .map((combined: IEntityCombined<IProgramEntity, IProgramMetadata>) => (combined.entity));
    },
  },
});
</script>
