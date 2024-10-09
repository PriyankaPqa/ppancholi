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
          @update:appliedFilter="onApplyFilterLocal"
          @load:filter="throttleOnLoadFilter($event)">
          <template #toolbarActions>
            <div class="d-flex">
              <div class="d-flex">
                <v-switch
                  v-model="teamTaskOnly"
                  data-test="task-table-team-task-switch"
                  :aria-label="$t('task.task_table.my_team_tasks')"
                  hide-details
                  @change="onTeamTaskToggleChange($event)" />
                <v-icon class="mx-2" small>
                  mdi-account-multiple
                </v-icon>
                <span class="rc-body14">
                  {{ $t('task.task_table.my_team_tasks') }}
                </span>
              </div>
            </div>
            <v-divider vertical class="mx-4" />
            <div class="d-flex">
              <div class="d-flex">
                <v-switch
                  v-model="personalTaskOnly"
                  data-test="task-table-personal-task-switch"
                  :aria-label="$t('task.task_table.my_personal_tasks')"
                  hide-details
                  @change="onPersonalTaskToggleChange($event)" />
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

      <template #[`item.${customColumns.taskCategory}`]="{ item }">
        <div>
          <v-icon data-test="task-category-icon" :color=" item.entity.taskType === TaskType.Team ? 'transparent' : 'grey'" small>
            mdi-account-check
          </v-icon>
          <router-link
            type="button"
            class="rc-link14 font-weight-bold pl-2"
            :data-test="`task-table-task-category-${item.entity.id}`"
            :to="getTaskDetailsRoute(item.entity.caseFileId, item.entity.id)">
            {{ item.metadata.taskCategory }}
          </router-link>
          <div class="pl-6">
            <span class="rc-red-text font-weight-bold"> {{ item.entity.isUrgent ? $t('task.create_edit.urgent') : '' }}</span>
          </div>
        </div>
      </template>
      <template #[`item.${customColumns.taskSubCategory}`]="{ item }">
        <span data-test="task-table-task-sub-category"> {{ item.entity.taskType === TaskType.Personal ? '' : (item.metadata.taskSubCategory || $t('common.N/A')) }}</span>
      </template>
      <template #[`item.${customColumns.assignTo}`]="{ item }">
        <span data-test="task-table-task-assign-to"> {{ getTeamName(item.entity.assignedTeamId) }}</span>
      </template>
      <template #[`item.${customColumns.userWorkingOn}`]="{ item }">
        <span data-test="task-table-user-working-on">  {{ item.metadata.userWorkingOnNameWithRole }}</span>
      </template>
      <template v-if="!isInCaseFile" #[`item.${customColumns.caseFileNumber}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          :data-test="`task-table-case-file-number-link-${item.entity.caseFileId}`"
          :to="getCaseFileDetailsRoute(item.entity.caseFileId)">
          <span data-test="task-table-case-file-number"> {{ item.metadata.caseFileNumber }}</span>
        </router-link>
      </template>
      <template #[`item.${customColumns.dateAdded}`]="{ item }">
        <span data-test="task-table-date-added"> {{ helpers.getLocalStringDate(item.entity.dateAdded, 'Task.dateAdded', 'PP') }}</span>
      </template>
      <template #[`item.${customColumns.taskStatus}`]="{ item }">
        <status-chip
          v-if="item.entity.taskType === TaskType.Team || item.entity.taskStatus === TaskStatus.Completed || item.entity.taskStatus === TaskStatus.Cancelled"
          data-test="task-table-task-status"
          x-small
          :status="item.entity.taskStatus"
          status-name="TaskStatus" />
      </template>
      <template #[`item.${customColumns.action}`]="{ item }">
        <v-btn
          v-if="canAction(item.entity)"
          color="primary"
          small
          :aria-label="$t('task.action')"
          :data-test="`task-table-action-btn-${item.entity.id}`"
          @click="setActioningTask(item)">
          {{ $t('task.action') }}
        </v-btn>
      </template>
      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn
          v-if="canEdit(item.entity)"
          icon
          small
          :aria-label="$t('common.edit')"
          :data-test="`task-table-edit-btn-${item.entity.id}`"
          @click="getEditTaskRoute(item.entity)">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
    <task-action-dialog
      v-if="showTaskActionDialog"
      :task-id="actioningTask.entity.id"
      :event-id="isInCaseFile ? caseFile.eventId : actioningTask.metadata.eventId"
      :selected-task-category-name="actioningTask.metadata.taskCategory"
      :selected-sub-category-name="actioningTask.metadata.taskSubCategory"
      :show.sync="showTaskActionDialog" />
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcAddButtonWithMenu, RcDataTable, RcPageLoading } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { IdParams, ITaskCombined, ITaskEntity, ITaskMetadata, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { TranslateResult } from 'vue-i18n';
import helpers from '@/ui/helpers/helpers';
import helper from '@libs/shared-lib/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useTaskMetadataStore, useTaskStore } from '@/pinia/task/task';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { UserRoles } from '@libs/entities-lib/user';
import { EFilterKeyType, EFilterType, FilterFormData, IFilterSettings } from '@libs/component-lib/types';
import { FilterKey, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useUserStore } from '@/pinia/user/user';
import { useTeamStore } from '@/pinia/team/team';
import { IDropdownItem, ISearchParams } from '@libs/shared-lib/types';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import TaskActionDialog from '@/ui/views/pages/case-files/details/case-file-task/components/TaskActionDialog.vue';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { IEntityCombined } from '@libs/entities-lib/base';
import { ITeamEntity } from '@libs/entities-lib/team';
import { ITEM_ROOT } from '@libs/services-lib/odata-query-sql/odata-query-sql';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

interface IParsedTaskMetadata extends ITaskMetadata {
  userWorkingOnNameWithRole?: string,
  taskCategory?: string,
  taskSubCategory?: string,
}

type IParsedTaskCombined = IEntityCombined<ITaskEntity, IParsedTaskMetadata>;

export default mixins(TablePaginationSearchMixin, EventsFilterMixin).extend({
  name: 'TasksTable',

  components: {
    RcDataTable,
    FilterToolbar,
    RcAddButtonWithMenu,
    StatusChip,
    TaskActionDialog,
    RcPageLoading,
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
      teamTaskOnly: false,
      options: {
        page: 1,
        sortBy: ['Entity/DateAdded'],
        sortDesc: [true],
      },
      helpers,
      TaskType,
      UserRoles,
      FilterKey,
      TaskStatus,
      showTaskActionDialog: false,
      actioningTask: null as IParsedTaskCombined,
      combinedTaskStore: new CombinedStoreFactory<ITaskEntity, ITaskMetadata, IdParams>(useTaskStore(), useTaskMetadataStore()),
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
      userAccountSearchQuery: '',
      userAccountFilter: [],
      teamSearchQuery: '',
      teamFilter: [],
    };
  },

  computed: {
    userId(): string {
      return useUserStore().getUserId();
    },

    personalTaskOnlyFilter(): Record<string, unknown> {
      return {
        or: {
          Entity: {
            TaskType: {
              [ITEM_ROOT]: helper.getEnumKeyText(TaskType, TaskType.Personal),
            },
            CreatedBy: {
              [ITEM_ROOT]: { value: this.userId, type: EFilterKeyType.Guid },
            },
          },
        },
      };
    },

    teamTaskOnlyFilter(): Record<string, unknown> {
      return {
        or: {
          Entity: {
            AssignedTeam: { TeamMembers: { any: { UserId: { value: this.userId, type: 'guid' } } } },
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
      };
    },

    customColumns(): Record<string, string> {
      return {
        taskCategory: `Metadata/TaskCategory/Translation/${this.$i18n.locale}`,
        taskSubCategory: `Metadata/SubCategory/Translation/${this.$i18n.locale}`,
        assignTo: 'Metadata/AssignedTeamName',
        userWorkingOn: 'Metadata/UserWorkingOnName',
        caseFileNumber: 'Metadata/CaseFileNumber',
        dateAdded: 'Entity/DateAdded',
        taskStatus: 'Entity/TaskStatus',
        action: 'action',
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      const headersList = [
        {
          text: this.$t('task.task_category') as string,
          sortable: true,
          value: this.customColumns.taskCategory,
          width: this.isInCaseFile ? '25%' : '20%',
        },
        {
          text: this.$t('task.task_table_header.sub_category') as string,
          sortable: true,
          value: this.customColumns.taskSubCategory,
          width: '15%',
        },
        {
          text: this.$t('task.task_table_header.assigned_to') as string,
          sortable: true,
          value: this.customColumns.assignTo,
          width: '15%',
        },
        {
          text: this.$t('task.task_details.working_on_it') as string,
          sortable: true,
          value: this.customColumns.userWorkingOn,
          width: '10%',
        },
        {
          text: this.$t('task.task_table_header.date_added') as string,
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
          text: this.$t('task.action') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.action,
          width: '2%',
        },
        {
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
          width: '2%',
        },
      ];

      const caseFileNumberHeader = {
        text: this.$t('task.task_table_header.case_file_number') as string,
        sortable: true,
        value: this.customColumns.caseFileNumber,
        width: '15%',
      };

      if (!this.isInCaseFile) {
        headersList.splice(3, 0, caseFileNumberHeader);
      }
      return headersList;
    },

    filterOptions(): Array<IFilterSettings> {
      const taskCategories = useTaskStore().getTaskCategory(true, false).map((t: IOptionItem) => ({ text: this.$m(t.name), value: t.id }));
      const priorityItems = [
        { text: this.$t('common.yes') as string, value: true },
        { text: this.$t('common.no') as string, value: false },
      ];
      const eventFilter = {
          key: 'Metadata/EventId',
          type: EFilterType.Select,
          keyType: EFilterKeyType.Guid,
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
          key: 'Entity/Category/OptionItemId',
          type: EFilterType.MultiSelect,
          keyType: EFilterKeyType.Guid,
          label: this.$t('task.task_category') as string,
          items: taskCategories,
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
          key: 'Metadata/TaskStatusName/Id',
          type: EFilterType.MultiSelect,
          label: this.$t('task.task_table_header.status') as string,
          items: helpers.enumToTranslatedCollection(TaskStatus, 'task.task_status'),
        },
        {
          key: 'Entity/AssignedTeamId',
          type: EFilterType.Select,
          keyType: EFilterKeyType.Guid,
          label: this.$t('task.task_table_header.assigned_to') as string,
          items: this.teamFilter,
          loading: useTeamStore().searchLoading,
          props: {
            'no-data-text': !this.teamSearchQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.teamSearchQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: 'Entity/UserWorkingOn',
          type: EFilterType.Select,
          keyType: EFilterKeyType.Guid,
          label: this.$t('task.task_details.working_on_it') as string,
          items: this.userAccountFilter,
          loading: useUserAccountStore().searchLoading,
          props: {
            'no-data-text': !this.userAccountSearchQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.userAccountSearchQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
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

    rawTableData(): ITaskCombined[] {
      return this.combinedTaskStore.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.isInCaseFile ? this.id : null } },
      );
    },

   parsedTableData(): IParsedTaskCombined[] {
     const taskCategoryOptionItems = useTaskStore().taskCategories;
      return this.rawTableData?.map((d) => {
        const taskSubcategoryOptionItems = taskCategoryOptionItems?.find((c) => c.id === d.entity.category.optionItemId)?.subitems || [];
        const taskCategory = helpers.getOptionItemNameFromListOption(taskCategoryOptionItems, d.entity.category);
        const taskSubCategory = helpers.getOptionItemNameFromListOption(taskSubcategoryOptionItems, d.entity.subCategory);

        let userWorkingOnNameWithRole = '';
          if (d.entity.userWorkingOn) {
            const userAccountMetadata = useUserAccountMetadataStore().getById(d.entity.userWorkingOn);
            userWorkingOnNameWithRole = `${userAccountMetadata?.displayName} (${this.$m(userAccountMetadata?.roleName) as string})`;
          } else {
            userWorkingOnNameWithRole = d.entity.taskStatus === TaskStatus.Completed ? '-' : this.$t('common.N/A') as string;
          }

        return {
          entity: d.entity,
          metadata: { ...d.metadata, taskSubCategory, taskCategory, userWorkingOnNameWithRole },
          pinned: d.pinned,
        };
      });
    },

    assignedTeamsIds(): string[] {
      return [...new Set(this.rawTableData?.map((d) => (d.entity.assignedTeamId)).filter((x) => x))];
    },

    assignedTeams(): ITeamEntity[] {
      return useTeamStore().getByIds(this.assignedTeamsIds);
    },
  },

  watch: {
    rawTableData: {
      async handler(nextValue, prevValue) {
        if (prevValue && nextValue !== prevValue) {
          await Promise.all([
            useTeamStore().fetchByIds(this.assignedTeamsIds, true),
            useUserAccountMetadataStore().fetchByIds(this.rawTableData?.map((d) => (d.entity.userWorkingOn)), true),
        ]);
        }
      },
      deep: true,
    },

    userAccountSearchQuery(newVal) {
      if (newVal !== null) {
        this.debounceSearchUserAccount(newVal);
      }
      if (newVal === null || newVal.trim().length === 0) {
        this.userAccountFilter = [];
      }
    },

    teamSearchQuery(newVal) {
      if (newVal !== null) {
        this.debounceSearchTeam(newVal);
      }
      if (newVal === null || newVal.trim().length === 0) {
        this.teamFilter = [];
      }
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await useTaskStore().fetchTaskCategories();
  },

  methods: {
    applyCustomFilter(value: boolean, filter: Record<string, unknown>) {
      let preparedFilters = {} as Record<string, unknown>;

      if (value) {
        // We apply filters from the switch + the ones from the filters panel
        if (this.userFilters?.or) {
          // when apply second toggle, clean up the value of the first toggle
          this.userFilters.or = [];
        }
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

      if (this.teamTaskOnly) {
        finalFilters = { ...finalFilters, ...this.teamTaskOnlyFilter };
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
      if (taskEntity.taskStatus === TaskStatus.Cancelled) {
        return false;
      }
      if (this.$hasLevel(UserRoles.level6)) {
        return true;
      }
      if (taskEntity.taskType === TaskType.Team) {
        if (taskEntity.taskStatus === TaskStatus.InProgress || taskEntity.taskStatus === TaskStatus.New) {
          return this.$hasLevel(UserRoles.level1) || taskEntity.createdBy === this.userId;
        }
      } else {
        return taskEntity.createdBy === this.userId;
      }
      return false;
      },

    canAction(task: ITaskEntity): boolean {
      if (task.taskStatus === TaskStatus.Cancelled && task.taskType === TaskType.Personal) {
        return false;
      }
      if (this.$hasLevel(UserRoles.level6)) {
        return !(task.taskType === TaskType.Personal && task.taskStatus === TaskStatus.Completed);
      }

      if (task.taskType === TaskType.Personal) {
        return task.createdBy === this.userId && task.taskStatus === TaskStatus.InProgress;
      }

      if (task.createdBy === this.userId && (task.taskStatus === TaskStatus.New || task.taskStatus === TaskStatus.Cancelled)) {
        return true;
      }

        // Team task --> for these roles, user needs to be part of the assigned team
        if (this.$hasLevel(UserRoles.level1)
          || this.$hasRole(UserRoles.readonly)
          || this.$hasRole(UserRoles.contributor3)
          || this.$hasRole(UserRoles.contributorIM)
          || this.$hasRole(UserRoles.contributorFinance)) {
          const assignedTeam = this.assignedTeams?.find((t) => t.id === task.assignedTeamId);
          return assignedTeam?.teamMembers.some((m) => m.id === this.userId);
        }
        // L0, no-role --> false
        return false;
    },

    setActioningTask(item: ITaskCombined) {
      this.actioningTask = item;
      this.showTaskActionDialog = true;
    },

    additionalFilters() {
      return {
        personalTaskOnlyFilter: this.personalTaskOnly,
        teamTaskOnlyFilter: this.teamTaskOnly,
      };
    },

    setAdditionalFilters(state: unknown) {
      this.personalTaskOnly = (state as any)?.personalTaskOnlyFilter || false;
      this.teamTaskOnly = (state as any)?.teamTaskOnlyFilter || false;
    },

    onTeamTaskToggleChange(value: boolean) {
      this.personalTaskOnly = false;
      this.applyCustomFilter(value, this.teamTaskOnlyFilter);
    },

    onPersonalTaskToggleChange(value: boolean) {
      this.teamTaskOnly = false;
      this.applyCustomFilter(value, this.personalTaskOnlyFilter);
    },

    getTeamName(assignedTeamId: string): string {
      return this.assignedTeams.find((t) => t.id === assignedTeamId)?.name;
    },

    async fetchData(params: ISearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await this.combinedTaskStore.search({
        filter: this.isInCaseFile ? { 'Entity/CaseFileId': { value: this.$route.params.id, type: EFilterKeyType.Guid }, ...filterParams } : { ...filterParams },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      }, null, false, true);
      return res;
    },

    debounceSearchUserAccount: _debounce(function func(this: any, query: string) {
      if (query.trim().length > 0) {
        this.fetchUserAccountFilter(query);
      }
    }, 500),

    async fetchUserAccountFilter(querySearch: string) {
        const searchParam = helpers.toQuickSearchSql(querySearch, 'Metadata/DisplayName');

        const filter = {
          ...searchParam,
        } as Record<any, any>;

        const params = {
          filter,
          top: 5,
          orderBy: 'Metadata/DisplayName asc',
        };

        const res = await this.combinedUserAccountStore.search(params, null, false, true);
        this.userAccountFilter = res?.values.map((e) => ({
          text: e.metadata.displayName,
          value: e.id,
        }));
    },

    debounceSearchTeam: _debounce(function func(this: any, query: string) {
      if (query.trim().length > 0) {
        this.fetchTeamFilter(query);
      }
    }, 500),

    async fetchTeamFilter(querySearch: string) {
        const filter = {
          ...(this.isInCaseFile ? { Entity: { Events: { any: { Id: { value: this.caseFile.eventId, type: 'guid' } } } } } : {}),
          ...{ 'Entity/IsAssignable': true },
          ...helpers.toQuickSearchSql(querySearch, 'Entity/Name'),
        };

        const params = {
          filter,
          top: 5,
          orderBy: 'Entity/Name asc',
        };

        const res = await useTeamStore().search({ params });
        this.teamFilter = res?.values.map((e) => ({
          text: e.name,
          value: e.id,
        }));
    },

    onAutoCompleteUpdate(
      { filterKey, search, selectedItem }:
        { filterKey: string, search: string, selectedItem: IDropdownItem },
    ) {
      if ((filterKey === 'Entity/EventId' || filterKey === 'Metadata/EventId' || filterKey === 'SearchItem/EventId') && search !== selectedItem?.text) {
        this.eventFilterQuery = search;
      }
      if ((filterKey === 'Entity/UserWorkingOn' && search !== selectedItem?.text)) {
        this.userAccountSearchQuery = search;
      }
      if ((filterKey === 'Entity/AssignedTeamId' && search !== selectedItem?.text)) {
        this.teamSearchQuery = search;
      }
    },

    throttleOnLoadFilter: _throttle(async function func(this:any, filterFormData: FilterFormData) {
      const filterItems = filterFormData.values;
      if (!filterItems) {
        return;
      }
      await this.onLoadFilter(filterFormData);
      this.userAccountFilter = [filterItems['Entity/UserWorkingOn'].value];
      this.teamFilter = [filterItems['Entity/AssignedTeamId'].value];
    }, 500),
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
</style>
