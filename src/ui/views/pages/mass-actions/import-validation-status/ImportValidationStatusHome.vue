<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :headers="headers"
      :labels="labels"
      :table-props="tableProps"
      :show-add-button="$hasLevel('level6') || $hasRole('contributorIM')"
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
        {{ getLastRunMetadata(item) ? getLastRunMetadata(item) && getLastRunMetadata(item).results.total : $t('common.toBeDetermined') }}
      </template>

      <template #[`item.${customColumns.successful}`]="{ item }">
        {{ getLastRunMetadata(item) ? getLastRunMetadata(item) && getLastRunMetadata(item).results.successes : $t('common.toBeDetermined') }}
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="MassActionRunStatus" :status="getLastRunEntity(item).runStatus" />
      </template>

      <template #[`item.deleteButton`]="{ item }">
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
import { RcDataTable } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import massActionsTable from '@/ui/mixins/massActionsTable';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { MassActionType } from '@/entities/mass-action';

export default mixins(TablePaginationSearchMixin, massActionsTable).extend({
  name: 'ImportValidationStatusHome',

  components: {
    RcDataTable,
    StatusChip,
  },

  data() {
    return {
      // To be defined to filter on type for the search api (see mixin massActionsTable)
      massActionType: MassActionType.ImportValidationOfImpactStatus,
      detailsRouteName: routes.massActions.importValidationStatus.details.name,
      tableTitle: 'massAction.impactValidationStatusTable.title',
      searchEndpoint: 'validate-impact-status-mass-actions',
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
  },

  methods: {
    goToAdd() {
      this.$router.push({ name: routes.massActions.importValidationStatus.create.name });
    },
  },
});
</script>
