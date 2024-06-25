<template>
  <div>
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
      <template v-if="$hasLevel(UserRoles.level6)" #headerLeft>
        <rc-add-button-with-menu :items="menuItems" data-test="create-financial-assistance-table-button" @click-item="onClickMenuItem($event)" />
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
        {{ $m(getProgramName(item.programId)) }}
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`eventDetail-link-${item.id}`"
          :to="getDetailsRoute(item)">
          {{ $m(item.name) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="Status" :status="item.status" />
      </template>

      <template #[`item.editButton`]="{ item }">
        <v-btn
          icon
          class="mr-2"
          :aria-label="$t('common.edit')"
          :data-test="`edit_financial_assistance_${ item.name && item.name.translation.en }`"
          @click="goToEdit(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDataTable, RcAddButtonWithMenu } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { DataTableHeader } from 'vuetify';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import routes from '@/constants/routes';
import { ISearchParams, Status } from '@libs/shared-lib/types';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useProgramStore } from '@/pinia/program/program';
import
{
  IFinancialAssistanceTableEntity,
} from '@libs/entities-lib/financial-assistance';
import { UserRoles } from '@libs/entities-lib/user';

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
      programIds: [],
      UserRoles,
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
        text: this.$t('common.edit') as string,
        class: 'rc-transparent-text',
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

    tableData(): IFinancialAssistanceTableEntity[] {
      return useFinancialAssistanceStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        { baseDate: this.searchExecutionDate, parentId: { eventId: this.eventId } },
      );
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useFinancialAssistanceStore().searchLoading,
        itemClass: (item: IFinancialAssistanceTableEntity) => (item.pinned ? 'pinned' : ''),
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

    programs(): Array<IProgramEntity> {
      return useProgramStore().getByIds(this.programIds);
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await this.fetchPrograms();
  },

  methods: {
    async fetchData(params: ISearchParams) {
      const filterParams = Object.keys(params.filter || {}).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await useFinancialAssistanceStore().search({ params: {
        filter: { 'Entity/EventId': { value: this.eventId, type: EFilterKeyType.Guid }, ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      },
      includeInactiveItems: true });

      return res;
    },

    onClickMenuItem(item: Record<string, string>) {
      if (item.value === 'new') {
        this.$router.push({
          name: routes.events.financialAssistance.create.name,
        });
      }
    },

    goToEdit(item: IFinancialAssistanceTableEntity) {
      this.$router.push({
        name: routes.events.financialAssistance.edit.name,
        params: { faId: item.id },
      });
    },

    getDetailsRoute(item: IFinancialAssistanceTableEntity) {
      return {
        name: routes.events.financialAssistance.details.name,
        params: {
          faId: item.id,
        },
      };
    },

    async fetchPrograms() {
      const res = await useProgramStore().search({ params: {
        filter: { 'Entity/EventId': { value: this.eventId, type: EFilterKeyType.Guid } },
        count: true,
                      orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      },
      includeInactiveItems: true });

      if (res) {
        this.programIds = res.ids;
      }
    },
    getProgramName(programId: string) {
      return this.programs?.find((x) => x.id === programId)?.name;
    },
  },
});
</script>
