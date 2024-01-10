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
      <template v-if="$hasLevel(UserRoles.level6)" #headerLeft>
        <rc-add-button-with-menu
          :add-button-label="$t('massActions.assessment.tooltip.add')"
          :items="menuItems"
          data-test="create-fa-mass-action"
          @click-item="goToAdd($event)" />
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link class="rc-link14 font-weight-bold" data-test="massAction-name" :to="goToDetails(item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.dateCreated}`]="{ item }">
        {{ format(parseISO(item.entity.created), 'PP') }}
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

      <template #[`item.deleteButton`]="{ item }">
        <v-btn v-if="showDeleteIcon(item)" icon class="mr-2" :aria-label="$t('common.delete')" data-test="delete" @click="onDelete(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
    <assessment-case-file-filtering v-if="showProcessByList" :show.sync="showProcessByList" />
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcDataTable, RcAddButtonWithMenu } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import massActionsTable from '@/ui/views/pages/mass-actions/mixins/massActionsTable';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';
import { UserRoles } from '@libs/entities-lib/user';
import AssessmentCaseFileFiltering from './AssessmentCaseFileFiltering.vue';

export default mixins(TablePaginationSearchMixin, massActionsTable).extend({
  name: 'AssessmentHome',

  components: {
    AssessmentCaseFileFiltering,
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
  },

  data() {
    return {
      // To be defined to filter on type for the search api (see mixin massActionsTable)
      massActionTypeData: MassActionType.Assessments,
      detailsRouteNameData: routes.massActions.assessments.details.name,
      tableTitleData: 'massAction.assessmentTable.title',
      showProcessByList: false,
      searchEndpointData: 'assessment-mass-actions',
      UserRoles,
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
          text: this.$t('common.delete') as string,
          class: 'rc-transparent-text',
          value: 'deleteButton',
          sortable: false,
        },
      ];
    },

    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('massAction.assessment.table.add.list') as string,
        value: MassActionMode.List,
        icon: 'mdi-filter-variant',
        dataTest: 'fa-mass-action-list',
      }, {
        text: this.$t('massAction.assessment.table.add.file') as string,
        value: MassActionMode.File,
        icon: 'mdi-upload',
        dataTest: 'fa-mass-action-file',
      }];
    },
  },

  created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    goToAdd(item: Record<string, string>) {
      if (item.value === MassActionMode.File) {
        this.$router.push({ name: routes.massActions.assessments.create.name, query: { mode: MassActionMode.File } });
      } else if (item.value === MassActionMode.List) {
        this.showProcessByList = true;
      }
    },
  },
});
</script>
