<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :footer-text="footerText"
      :labels="labels"
      :table-props="tableProps"
      :initial-search="params && params.search"
      :show-add-button="showAddButton"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      @add-button="goToAdd"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link class="rc-link14 font-weight-bold" data-test="massAction-name" :to="goToDetails(item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template v-if="showType" #[`item.${customColumns.type}`]="{ item }">
        {{ typeText(item) }}
      </template>

      <template #[`item.${customColumns.dateCreated}`]="{ item }">
        {{ moment(item.entity.created).local().format('ll') }}
      </template>

      <template #[`item.${customColumns.projected}`]="{ item }">
        {{ getLastRunMetadata(item) && getLastRunMetadata(item).results ? getLastRunMetadata(item).results.total : $t('common.toBeDetermined') }}
      </template>

      <template #[`item.${customColumns.successful}`]="{ item }">
        {{ getLastRunMetadata(item) && getLastRunMetadata(item).results ? getLastRunMetadata(item).results.successes : $t('common.toBeDetermined') }}
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="MassActionRunStatus" :status="getLastRunEntity(item).runStatus" />
      </template>

      <template v-for="col in additionalColumns" #[`item.${col.header.value}`]="{ item }">
        {{ col.templateFct(item) }}
      </template>

      <template #[`item.${customColumns.deleteButton}`]="{ item }">
        <v-btn v-if="showDeleteIcon(item)" icon class="mr-2" data-test="delete" @click="onDelete(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcDataTable } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import massActionsTable from '@/ui/views/pages/mass-actions/mixins/massActionsTable';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { MassActionDataCorrectionType, MassActionType } from '@libs/entities-lib/mass-action';

export default mixins(TablePaginationSearchMixin, massActionsTable).extend({
  name: 'MassActionBaseTable',

  components: {
    RcDataTable,
    StatusChip,
  },

  props: {
    massActionType: {
      type: [
        Number as () => MassActionType,
        Array as () => Array<MassActionDataCorrectionType>,
      ],
      required: true,
    },

    detailsRouteName: {
      type: String,
      required: true,
    },

    addRouteName: {
      type: String,
      required: true,
    },

    tableTitle: {
      type: String,
      required: true,
    },

    searchEndpoint: {
      type: String,
      required: true,
    },

    showAddButton: {
      type: Boolean,
      required: true,
    },

    addButtonLabel: {
      type: String,
      default: '',
    },

    /**
     * To show the type column
     */
    showType: {
      type: Boolean,
      default: false,
    },

    /**
     * To show the type column
     */
    typeText: {
      type: Function,
      default: () => 'Default type',
    },

    additionalColumns: {
      type: Array as () => { name: string, header: DataTableHeader, index: number, templateFct: (item: any) => string }[],
      default: () => [] as { name: string, header: DataTableHeader, index: number, templateFct: (item: any) => string }[],
    },
  },

  // MassActionBaseTable and FinancialAssistanceHome are both using the same mixin
  // FinancialAssistanceHome works with data
  // MassActionBaseTable works with props
  mounted() {
    this.massActionTypeData = this.massActionType;
    this.detailsRouteNameData = this.detailsRouteName;
    this.tableTitleData = this.tableTitle;
    this.addButtonLabelData = this.addButtonLabel;
    this.searchEndpointData = this.searchEndpoint;
  },

  created() {
    this.saveState = true;
    this.loadState();
  },

  computed: {
    customColumns(): Record<string, string> {
      const defaultColumns = {
        name: 'Entity/Name',
        dateCreated: 'Entity/Created',
        projected: 'Metadata/LastRun/Results/Total',
        successful: 'Metadata/LastRun/Results/Successes',
        status: 'Metadata/LastRun/RunStatus',
        deleteButton: 'deleteButton',
      };
      const cols = !this.showType ? defaultColumns : { ...defaultColumns, type: 'Entity/Type' };

      for (let i = 0; i < this.additionalColumns.length; i += 1) {
        (cols as any)[this.additionalColumns[i].name] = this.additionalColumns[i].header.value;
      }
      return cols;
    },
    headers(): Array<DataTableHeader> {
      const defaultHeaders = [
        {
          text: this.$t('massAction.common.name') as string,
          align: 'start',
          sortable: true,
          value: this.customColumns.name,
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
        },
      ] as Array<DataTableHeader>;
      const type = {
        text: this.$t('massAction.common.type') as string,
        align: 'start',
        sortable: true,
        value: 'Entity/Type',
      } as DataTableHeader;
      const headers = !this.showType ? defaultHeaders : [...defaultHeaders.slice(0, 1), type, ...defaultHeaders.slice(1)];

      for (let i = 0; i < this.additionalColumns.length; i += 1) {
        headers.splice(this.additionalColumns[i].index, 0, this.additionalColumns[i].header);
      }

      return headers;
    },
  },

  methods: {
    goToAdd() {
      this.$router.push({ name: this.addRouteName });
    },
  },
});
</script>
