<template>
  <div class="pa-4">
    <rc-data-table
      ref="approvalTables"
      data-test="approval-tables"
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :initial-search="params && params.search"
      :options.sync="options"
      :custom-columns="[...Object.values(customColumns), 'actions']"
      @search="search">
      <template #headerLeft>
        <rc-add-button-with-menu
          :items="menuItems"
          :add-button-label="$t('common.add')"
          data-test="add-approval-table"
          @click-item="handleCreate($event)" />
      </template>

      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.ApprovalTables"
          :filter-options="filters"
          :initial-filter="filterState"
          :count="itemsCount"
          add-filter-label="approvalsTable.filter.title"
          @update:appliedFilter="onApplyFilter" />
      </template>

      <template #[`item.${customColumns.program}`]="{ item }">
        {{ $m(item.metadata.programName) }}
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          data-test="approval_table_details-link"
          :to="getDetailsRoute(item.entity.id)">
          {{ $m(item.entity.name) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="Status" :status="item.entity.status" />
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn icon class="mr-2" data-test="edit_approval_table" @click="goToEdit(item.entity.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-btn icon class="mr-2" :disabled="true" data-test="delete_approval_table" @click="deleteItem(item.entity.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">

import routes from '@/constants/routes';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  RcDataTable,
  RcAddButtonWithMenu,
} from '@libs/component-lib/components';
import { IApprovalTableCombined } from '@libs/entities-lib/approvals/approvals-table';
import { TranslateResult } from 'vue-i18n';
import { DataTableHeader } from 'vuetify';
import { EFilterType, IFilterSettings, ITableAddButtonMenuItems } from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { IEntityCombined, Status } from '@libs/entities-lib/base';
import _isEmpty from 'lodash/isEmpty';
import { IProgramEntity, IProgramMetadata } from '@libs/entities-lib/program';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'ApprovalTablesHome',

  components: {
    FilterToolbar,
    RcAddButtonWithMenu,
    RcDataTable,
    StatusChip,
  },

  data() {
    return {
      searchLoading: false,
      programs: [],
      FilterKey,
      options: {
        page: 1,
        sortBy: [`Metadata/ApprovalTableStatusName/Translation/${this.$i18n.locale}`],
        sortDesc: [false],
      },
    };
  },

  created() {
    // So filters are retrieved
    this.saveState = true;
    this.loadState();
    this.fetchPrograms();
  },

  methods: {
    goToCreate() {
      this.$router.push({ name: routes.events.approvals.create.name });
    },

    goToCopyFromTemplate() {
      // TODO in a future story
    },

    goToEdit(id: string) {
      this.$router.push({ name: routes.events.approvals.edit.name, params: { approvalId: id } });
    },

    async deleteItem(id: string) {
      const userChoice = await this.$confirm({
        title: this.$t('common.delete'),
        messages: this.$t('approvalTables.confirm.delete.message'),
      });

      userChoice && await this.$storage.approvalTable.actions.deactivate(id);
    },

    getDetailsRoute(id: string) {
      return {
        name: routes.events.approvals.details.name,
        params: {
          approvalId: id,
        },
      };
    },

    handleCreate(selection: ITableAddButtonMenuItems) {
      if (selection.value === 'createNew') {
        this.goToCreate();
      } else if (selection.value === 'copyFrom') {
        this.goToCopyFromTemplate();
      }
    },

    async fetchData(params: IAzureSearchParams) {
      this.searchLoading = true;

      if (_isEmpty(params.filter)) {
        params.filter = this.presetFilter;
      }
      const res = await this.$storage.approvalTable.actions.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
      this.searchLoading = false;
      return res;
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

  computed: {
    eventId(): string {
      return this.$route.params.id;
    },

    presetFilter(): Record<string, string> {
      return {
        'Entity/EventId': this.eventId,
      };
    },

    tableData(): IApprovalTableCombined[] {
      return this.$storage.approvalTable.getters.getByIds(this.searchResultIds, {
        prependPinnedItems: true,
        baseDate: this.searchExecutionDate,
        parentId: { eventId: this.eventId },
      });
    },

    customColumns(): Record<string, string> {
      return {
        program: `Metadata/ProgramName/Translation/${this.$i18n.locale}`,
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: `Metadata/ApprovalTableStatusName/Translation/${this.$i18n.locale}`,
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult, addButtonLabel: TranslateResult } } {
      return {
        header: {
          title: this.$t('approvalsTable.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('approvalsTable.addApprovals'),
        },
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('approvalsTable.programName') as string,
          align: 'start',
          sortable: false,
          value: this.customColumns.program,
          width: '20%',
        },
        {
          text: this.$t('approvalsTable.name') as string,
          align: 'start',
          sortable: true,
          value: this.customColumns.name,
          width: '60%',
        },
        {
          text: this.$t('common.status') as string,
          align: 'center',
          sortable: true,
          value: this.customColumns.status,
          width: '50px',
        },
        {
          align: 'end',
          text: '',
          value: 'actions',
          sortable: false,
          width: '120px',
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      return [{
        key: this.customColumns.program,
        type: EFilterType.MultiSelect,
        label: this.$t('approvalsTable.programName') as string,
        items: this.programs.map((p: IProgramEntity) => ({
          value: this.$m(p.name),
          text: this.$m(p.name),
        })),
      }, {
        key: this.customColumns.name,
        type: EFilterType.Text,
        label: this.$t('common.name') as string,
      }, {
        key: 'Entity/Status',
        type: EFilterType.MultiSelect,
        label: this.$t('common.status') as string,
        items: helpers.enumToTranslatedCollection(Status, 'enums.Status', false),
      },
      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.searchLoading,
        itemClass: (item: IApprovalTableCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    menuItems(): Array<ITableAddButtonMenuItems> {
      return [{
        text: this.$t('approvalTables.create_new_table') as string,
        icon: 'mdi-file',
        value: 'createNew',
        dataTest: 'create_new_table',
      }, {
        text: this.$t('approvalTables.copy_from_template') as string,
        icon: 'mdi-content-copy',
        value: 'copyFrom',
        disabled: true,
        dataTest: 'copy_from_template',
      }];
    },
  },
});
</script>
