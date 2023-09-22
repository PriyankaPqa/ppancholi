<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      @add-button="goToAdd"
      @search="search">
      <template #headerLeft>
        <rc-add-button-with-menu
          :add-button-label="$t('massAction.caseFileStatus.tooltip.add')"
          :items="menuItems"
          data-test="create-case-file-status-mass-action"
          @click-item="goToAdd($event)" />
      </template>
    </rc-data-table>
    <case-file-status-mass-action-filtering v-if="showProcessByList" :show.sync="showProcessByList" />
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { DataTableHeader } from 'vuetify';
import { RcDataTable, RcAddButtonWithMenu } from '@libs/component-lib/components';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import massActionsTable from '@/ui/views/pages/mass-actions/mixins/massActionsTable';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';
import routes from '@/constants/routes';
import CaseFileStatusMassActionFiltering from './CaseFileStatusMassActionFiltering.vue';

export default mixins(TablePaginationSearchMixin, massActionsTable).extend({
  name: 'CaseFileStatusMassActionHome',

  components: {
    CaseFileStatusMassActionFiltering,
    RcDataTable,
    RcAddButtonWithMenu,
  },

  data() {
    return {
      massActionTypeData: MassActionType.CaseFileStatus,
      tableTitleData: 'massAction.caseFileStatus.title',
      showProcessByList: false,
      searchEndpointData: '',
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
        deleteButton: 'deleteButton',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('massAction.common.name') as string,
          align: 'start',
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('massAction.common.dateCreated') as string,
          value: this.customColumns.dateCreated,
          sortable: true,
        },
        {
          text: this.$t('massAction.common.projected') as string,
          value: this.customColumns.projected,
          sortable: true,
        },
        {
          text: this.$t('massAction.common.successful') as string,
          value: this.customColumns.successful,
          sortable: true,
        },
        {
          text: this.$t('massAction.common.status') as string,
          value: this.customColumns.status,
          sortable: false,
        },
        {
          align: 'end',
          text: '',
          value: 'deleteButton',
          sortable: false,
        },
      ];
    },

    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('massAction.caseFileStatus.table.add.list') as string,
        value: MassActionMode.List,
        icon: 'mdi-filter-variant',
        dataTest: 'mass-action-case-file-status-add-list',
      }, {
        text: this.$t('massAction.caseFileStatus.table.add.file') as string,
        value: MassActionMode.File,
        icon: 'mdi-upload',
        dataTest: 'mass-action-case-file-status-add-file',
      }];
    },
  },

  methods: {
    goToAdd(item: Record<string, string>) {
      if (item.value === MassActionMode.File) {
        this.$router.push({ name: routes.massActions.caseFileStatus.create.name, query: { mode: MassActionMode.File } });
      } else if (item.value === MassActionMode.List) {
        this.showProcessByList = true;
      }
    },
  },

});
</script>
