<template>
  <rc-data-table
    ref="tasksTable"
    data-test="tasks-table"
    :items="[]"
    :count="itemsCount"
    :show-help="false"
    labels="Tasks enenenen"
    :headers="headers">
    <template #filter>
      <filter-toolbar
        :count="itemsCount"
        :loading="loading"
        add-filter-label="caseFileTable.filter">
        <template #toolbarActions>
          <div class="flex-row">
            <v-icon class="mr-2">
              mdi-account-check
            </v-icon>
            <span class="rc-body14">
              {{ $t('caseFilesTable.myCaseFiles') }}
            </span>
          </div>
        </template>
      </filter-toolbar>
    </template>
    <template v-if="isInCaseFile" #headerLeft>
      <rc-add-button-with-menu
        :items="menuItems"
        data-test="create-team-button"
        :add-button-label="$t('teams.add_team')"
        @click-item="goToCreateTask($event)" />
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcDataTable, RcAddButtonWithMenu } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';
import { useTaskStore } from '@/pinia/task/task';

export default mixins(caseFileDetail).extend({
  name: 'TasksTable',

  components: {
    RcDataTable,
    FilterToolbar,
    RcAddButtonWithMenu,
  },

  props: {
    // case file id
    id: {
      type: String,
      default: '',
    },

    isInCaseFile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      itemsCount: 0,
      loading: false,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFileTable.tableHeaders.caseFileNumber') as string,
          sortable: true,
          value: '1',
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.name') as string,
          sortable: true,
          value: '2',
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.event') as string,
          sortable: true,
          value: '3',
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.triage') as string,
          sortable: true,
          value: '4',
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.status') as string,
          sortable: true,
          value: '5',
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.createdDate') as string,
          sortable: true,
          value: '6',
        },
      ];
    },

    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('task.create.new_personal_task') as string,
        value: 'personal',
        dataTest: 'create-personal-task-link',
      }, {
        text: this.$t('task.create.new_team_task') as string,
        value: 'team',
        dataTest: 'create-team-task-link',
      }];
    },
  },

  async created() {
    await useTaskStore().fetchTaskCategories();
  },

  methods: {
    goToCreateTask(item: Record<string, string>) {
      const taskType = item.value;
      this.$router.push({ name: routes.caseFile.task.create.name,
        params: {
          taskType,
          id: this.id,
        } });
    },
  },

});
</script>
