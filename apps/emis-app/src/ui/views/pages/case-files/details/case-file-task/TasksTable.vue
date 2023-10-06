<template>
  <div class="pa-4">
    <rc-data-table
      ref="tasksTable"
      :items="parsedTableData"
      :count="itemsCount"
      :show-help="false"
      :labels="labels"
      :custom-columns="Object.values(customColumns)"
      :table-props="tableProps"
      :footer-text="footerText"
      :headers="headers"
      :options.sync="options"
      :initial-search="params && params.search"
      @search="search">
      <template v-if="isInCaseFile" #headerLeft>
        <rc-add-button-with-menu
          :items="menuItems"
          data-test="task-table-create-task-button"
          :add-button-label="$t('task.add_task')"
          @click-item="goToCreateTask($event)" />
      </template>

      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Tasks"
          :count="itemsCount"
          :initial-filter="filterState"
          :filter-options="filterOptions"
          add-filter-label="tasksTable.filter"
          @open="isInCaseFile ? null : fetchEventsFilter()"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @update:appliedFilter="onApplyFilterLocal">
          <template #toolbarActions>
            <div class="d-flex">
              <div class="d-flex">
                <v-switch
                  v-model="personalTaskOnly"
                  data-test="task-table-personal-task-switch"
                  hide-details />
                <v-icon class="mx-2" small>
                  mdi-account-check
                </v-icon>
                <span class="rc-body14">
                  {{ $t('task.task_table.my_personal_tasks') }}
                </span>
              </div>
            </div>
          </template>
        </filter-toolbar>
      </template>

      <template v-if="isInCaseFile" #expanded-item="{ item }">
        <!-- Custom content to show when a row is expanded -->
        <td :colspan="headers.length ">
          <v-row class="pl-8 mb-1" data-test="task-table-expanded-row">
            <template v-if="item.entity.taskType === TaskType.Team">
              <v-col cols="2">
                <div class="fw-bold">
                  {{ $t('task.create_edit.task_category') }}
                </div>
                <div v-if="item.entity.category">
                  {{ $m(item.entity.category.displayName) }}
                </div>
              </v-col>
              <v-col cols="2">
                <div class="fw-bold">
                  {{ $t("task.create_edit.assigned_to") }}
                </div>
                <div> {{ item.entity.assignedTeamName }} </div>
              </v-col>
            </template>

            <template v-else>
              <v-col cols="2">
                <div class="fw-bold">
                  {{ $t('task.create_edit.due_date') }}
                </div>
                <div>{{ helpers.getLocalStringDate(item.entity.dueDate, '', 'MMM d, yyyy') }}</div>
              </v-col>
            </template>
          </v-row>
        </td>
      </template>

      <template #[`item.${customColumns.taskName}`]="{ item }">
        <div :class="{ 'ml-4': !isInCaseFile }">
          <v-icon class="adjust-margin" :color=" item.entity.taskType === TaskType.Team ? 'transparent' : 'grey'" small>
            mdi-account-check
          </v-icon>
          <router-link
            type="button"
            class="rc-link14 font-weight-bold pl-2"
            data-test="task-table-task-name"
            :to="getTaskDetailsRoute(item.metadata.caseFileId, item.entity.id)">
            {{ $m(item.metadata.name) }}
          </router-link>
        </div>
      </template>
      <template v-if="!isInCaseFile" #[`item.${customColumns.caseFileNumber}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="task-table-case-file-number-link"
          :to="getCaseFileDetailsRoute(item.metadata.caseFileId)">
          <span data-test="task-table-case-file-number"> {{ item.metadata.caseFileNumber }}</span>
        </router-link>
      </template>
      <template #[`item.${customColumns.isUrgent}`]="{ item }">
        <span class="red--text font-weight-bold"> {{ item.entity.isUrgent ? $t('task.create_edit.urgent') : '' }}</span>
      </template>
      <template #[`item.${customColumns.dateAdded}`]="{ item }">
        <span data-test="task-table-date-added"> {{ helpers.getLocalStringDate(item.entity.dateAdded, '', 'MMM d, yyyy') }}</span>
      </template>
      <template #[`item.${customColumns.taskStatus}`]="{ item }">
        <status-chip
          v-if="item.entity.taskType === TaskType.Team"
          data-test="task-table-task-status"
          x-small
          :status="item.entity.taskStatus"
          status-name="TaskStatus" />
      </template>
      <template #[`item.${customColumns.action}`]="{ item }">
        <v-btn
          color="primary"
          small
          :data-test="`task-table-action-btn-${item.entity.id}`">
          {{ $t('task.action') }}
        </v-btn>
      </template>
      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn
          v-if="canEdit(item.entity)"
          icon
          small
          @click="getEditTaskRoute(item.entity)">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcAddButtonWithMenu, RcDataTable } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { IdParams, ITaskCombined, ITaskEntity, ITaskEntityData, ITaskMetadata, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { TranslateResult } from 'vue-i18n';
import helpers from '@/ui/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useTaskMetadataStore, useTaskStore } from '@/pinia/task/task';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { UserRoles } from '@libs/entities-lib/user';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useUserStore } from '@/pinia/user/user';
import { IAzureSearchParams, IMultilingual } from '@libs/shared-lib/types';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import { ITeamEntity } from '@libs/entities-lib/team';
import { IEntityCombined } from '@libs/entities-lib/base';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';

interface IParsedTaskEntity extends ITaskEntityData {
  category: {
    optionItemId: string;
    specifiedOther: string;
    displayName: IMultilingual | string;
  }
  assignedTeamName: string;
}

type IParsedTaskCombined = IEntityCombined<IParsedTaskEntity, ITaskMetadata>;

export default mixins(TablePaginationSearchMixin, EventsFilterMixin).extend({
  name: 'TasksTable',

  components: {
    RcDataTable,
    FilterToolbar,
    RcAddButtonWithMenu,
    StatusChip,
  },

  props: {
    id: {
      type: String,
      default: '',
    },

    isInCaseFile: {
      type: Boolean,
      default: false,
    },

    caseFile: {
      type: Object as () => ICaseFileEntity,
      default: null,
    },
  },

  data() {
    return {
      personalTaskOnly: false,
      dataTableParams: {
        search: '',
        orderBy: 'Entity/DateAdded',
        descending: true,
        pageIndex: 1,
        pageSize: 10,
      },
      options: {
        page: 1,
        sortBy: ['Entity/DateAdded'],
        sortDesc: [true],
      },
      helpers,
      TaskType,
      UserRoles,
      FilterKey,
      teamsByEvent: [] as ITeamEntity[],
      combinedTaskStore: new CombinedStoreFactory<ITaskEntity, ITaskMetadata, IdParams>(useTaskStore(), useTaskMetadataStore()),
    };
  },

  computed: {
    personalTaskOnlyFilter(): Record<string, unknown> {
      const userId = useUserStore().getUserId();
      return {
        Entity: {
          TaskType: {
              [ITEM_ROOT]: TaskType.Personal,
          },
          CreatedBy: {
            [ITEM_ROOT]: userId,
          },
        },
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      let title: TranslateResult = this.$t('task.table_title');
      if (!this.isInCaseFile) {
        title += ` (${this.itemsCount})`;
      }
      return {
        header: {
          title,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useTaskStore().searchLoading,
        itemClass: (item: ITaskCombined) => (item.pinned ? 'pinned' : ''),
        itemKey: 'entity.id',
        showExpand: this.isInCaseFile,
      };
    },

    customColumns(): Record<string, string> {
      return {
        taskName: `Metadata/Name/Translation/${this.$i18n.locale}`,
        caseFileNumber: 'Metadata/CaseFileNumber',
        isUrgent: 'Entity/IsUrgent',
        dateAdded: 'Entity/DateAdded',
        taskStatus: 'Entity/TaskStatus',
        action: 'action',
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      const headersList = [
        {
          text: this.$t('task.task_table_header.task') as string,
          sortable: true,
          value: this.customColumns.taskName,
          width: this.isInCaseFile ? '60%' : '40%',
        },
        {
          text: this.$t('task.task_table_header.priority') as string,
          sortable: true,
          value: this.customColumns.isUrgent,
          width: '10%',
        },
        {
          text: this.isInCaseFile ? this.$t('task.task_table_header.date_added') as string : this.$t('task.task_table_header.created_date') as string,
          sortable: true,
          value: this.customColumns.dateAdded,
          width: '10%',
        },
        {
          text: this.$t('task.task_table_header.status') as string,
          sortable: true,
          value: this.customColumns.taskStatus,
          width: '10%',

        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.action,
          width: '5%',
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.edit,
          width: '5%',
        },
      ];

      const caseFileNumberHeader = {
        text: this.$t('task.task_table_header.case_file_number') as string,
        sortable: true,
        value: this.customColumns.caseFileNumber,
        width: '20%',
      };

      if (!this.isInCaseFile) {
        headersList.splice(1, 0, caseFileNumberHeader);
      }
      return headersList;
    },

    filterOptions(): Array<IFilterSettings> {
      const taskNames = useTaskStore().getTaskCategories().map((t: IOptionItem) => ({ text: this.$m(t.name), value: t.id }));
      const priorityItems = [
        { text: this.$t('common.yes') as string, value: true },
        { text: this.$t('common.no') as string, value: false },
      ];
      const eventFilter = {
          key: 'Metadata/EventId',
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.eventName') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          disabled: this.eventsFilterDisabled,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        };

      const filters = [
        {
          key: 'Entity/Name/OptionItemId',
          type: EFilterType.MultiSelect,
          label: this.$t('task.create_edit.task_name') as string,
          items: taskNames,
        },
        {
          key: 'Entity/DateAdded',
          type: EFilterType.Date,
          label: this.$t('task.task_table_header.date_added') as string,
        },
        {
          key: 'Entity/IsUrgent',
          type: EFilterType.Select,
          label: this.$t('task.task_table_header.priority') as string,
          items: priorityItems,
        },
        {
          key: 'Entity/TaskStatus',
          type: EFilterType.MultiSelect,
          label: this.$t('task.task_table_header.status') as string,
          items: helpers.enumToTranslatedCollection(TaskStatus, 'task.task_status'),
        },
      ];
      if (!this.isInCaseFile) {
        filters.unshift(eventFilter);
      }
      return filters;
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

    parsedTableData(): IParsedTaskCombined[] {
      const rawTableData: ITaskCombined[] = this.combinedTaskStore.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.isInCaseFile ? this.id : null } },
      );
      const taskNames = useTaskStore().getTaskCategories();
      return rawTableData.map((d: any) => {
        const currentTaskName = taskNames?.filter((n) => n.id === d?.entity?.name.optionItemId)[0];
        const currentCategory = currentTaskName?.subitems.filter((c) => c.id === d?.entity.category?.optionItemId)[0];
        const assignedTeamName = this.teamsByEvent?.filter((t) => t.id === d?.entity?.assignedTeamId)[0];
        const parsedEntity = {
          ...d.entity,
          category: {
            ...d.entity.category,
            displayName: currentCategory ? currentCategory.name : null,
          },
          assignedTeamName: assignedTeamName ? assignedTeamName.name : '',
        };
        return {
          ...d,
          entity: parsedEntity,
          metadata: d.metadata,
        };
      });
    },
  },

  watch: {
    personalTaskOnly(newValue, oldValue) {
      if (oldValue == null || newValue === oldValue) {
        return;
      }
      this.applyCustomFilter(newValue, this.personalTaskOnlyFilter);
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    if (this.isInCaseFile) {
      await this.getTeamsByEvent();
    }
     await useTaskStore().fetchTaskCategories();
     await this.search(this.dataTableParams);
     },

  methods: {
    applyCustomFilter(value: boolean, filter: Record<string, unknown>) {
      let preparedFilters = {} as Record<string, unknown>;

      if (value) {
        // We apply filters from the switch + the ones from the filters panel
        preparedFilters = { ...this.userFilters, ...filter };
      } else if (isEqual(filter, this.userFilters)) {
        preparedFilters = null;
      } else {
        const filterValue = Object.values(filter)[0];
        preparedFilters = pickBy(this.userFilters, (value) => !isEqual(filterValue, value)); // Only the other filters
      }

      this.onApplyFilter({ preparedFilters, searchFilters: this.userSearchFilters }, this.filterState);
    },

    async onApplyFilterLocal({ preparedFilters, searchFilters }
                               : { preparedFilters: Record<string, unknown>, searchFilters: string }, filterState: unknown) {
      let finalFilters = preparedFilters;

      if (this.personalTaskOnly) {
        finalFilters = { ...finalFilters, ...this.personalTaskOnlyFilter };
      }

      await this.onApplyFilter({ preparedFilters: finalFilters, searchFilters }, filterState);
    },

    goToCreateTask(item: Record<string, string>) {
      const taskType = item.value;
      this.$router.push({ name: routes.caseFile.task.create.name,
        params: {
          taskType,
          id: this.id,
        } });
    },

    getTaskDetailsRoute(id: string, taskId: string) {
      return {
            name: routes.caseFile.task.details.name,
            params: {
              taskId,
              id,
            },
          };
    },

    getCaseFileDetailsRoute(caseFileId: string) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: caseFileId,
        },
      };
    },

    getEditTaskRoute(task: ITaskEntity) {
      this.$router.push({
        name: routes.caseFile.task.edit.name,
        params: {
          id: task.caseFileId,
          taskId: task.id,
          taskType: task.taskType === TaskType.Team ? 'team' : 'personal',
        },
      });
    },

    canEdit(taskEntity: ITaskEntity): boolean {
      if (this.$hasLevel(UserRoles.level6)) {
        return true;
      }
      const userId = useUserStore().getUserId();
      if (taskEntity.taskType === TaskType.Team) {
        if (taskEntity.taskStatus === TaskStatus.InProgress) {
          return this.$hasLevel(UserRoles.level1) || taskEntity.createdBy === userId;
        }
      }
      return taskEntity.createdBy === userId;
      },

    async getTeamsByEvent() {
      const teams = await this.$services.teams.getTeamsByEvent(this.caseFile?.eventId);
      if (teams) {
        this.teamsByEvent = teams;
      }
    },

    additionalFilters() {
      return {
        personalTaskOnlyFilter: this.personalTaskOnly,
      };
    },

    setAdditionalFilters(state: unknown) {
      // eslint-disable-next-line
      this.personalTaskOnly = (state as any)?.personalTaskOnlyFilter || false;
    },

    async fetchData(params: IAzureSearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await this.combinedTaskStore.search({
        search: params.search,
        filter: this.isInCaseFile ? { 'Entity/CaseFileId': this.$route.params.id, ...filterParams } : { ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
    },
  },

});
</script>

<style scoped lang="scss">
::v-deep .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__row td {
  border-bottom: 0 !important;
}

::v-deep .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: initial !important;
  & td {
    height: initial;
  }
}

.adjust-margin{
  margin-left: -16px
}
</style>
