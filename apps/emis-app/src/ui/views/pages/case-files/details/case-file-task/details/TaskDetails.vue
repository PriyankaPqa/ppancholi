<template>
  <rc-page-content
    :title="title"
    show-back-button
    @back="navigateBack">
    <rc-page-loading v-if="loading" />
    <v-row v-else class="justify-center mt-6">
      <v-col cols="12" lg="8">
        <v-container>
          <v-row class="px-16 mb-5 justify-space-between flex-nowrap">
            <div class="font-weight-bold rc-heading-5">
              {{ helpers.capitalize(displayedTaskName) }}
            </div>
            <div class="d-flex align-center">
              <template v-if="isTeamTask && task.isUrgent">
                <span class="red--text font-weight-bold" data-test="task-details-is-urgent">{{ $t('task.create_edit.urgent') }}</span>
                <v-divider vertical class="ml-4" />
              </template>

              <v-btn icon color="primary" class="mx-2" @click="showTaskHistoryDialog = true">
                <v-icon>
                  mdi-history
                </v-icon>
              </v-btn>

              <status-chip v-if="isTeamTask || task.taskStatus === TaskStatus.Completed" status-name="TaskStatus" :status="task.taskStatus" class="mr-4" />
              <template v-if="canEdit">
                <v-divider vertical class="mr-2" />
                <v-btn icon data-test="task-details-edit-button" @click="getEditTaskRoute()">
                  <v-icon> mdi-pencil </v-icon>
                </v-btn>
              </template>
            </div>
          </v-row>
          <template v-if="isTeamTask">
            <div class="creator-info px-13 grey--text rc-body12" data-test="task-details-team-task-creator-info">
              {{ teamTaskCreatorInfo }}
            </div>
            <div v-if="selectedTaskName && $m(selectedTaskName.description)" class="px-13 mt-2 grey-text rc-body14">
              <v-icon small class="mr-1 pb-1">
                mdi-alert-circle
              </v-icon>
              <span data-test="task-details-team-task-name-description"> {{ $m(selectedTaskName.description) }} </span>
            </div>
          </template>

          <v-row
            class="pl-4 py-2 d-flex justify-space-between d-flex align-center mx-13 mt-4 pr-4 pa-0 rc-body14"
            :class="{ 'assigned-to-action-team-task mb-0': displayWorkingOnIt, 'assigned-to-action mb-4': !displayWorkingOnIt }">
            <v-col cols="4" class="font-weight-bold pa-0">
              {{ $t('task.create_edit.assigned_to') }}
            </v-col>
            <v-col class="pa-0 pl-2" data-test="task-details-assigned-to">
              {{ (isTeamTask && assignedTeam) ? assignedTeam.name : assignedToPerson }}
            </v-col>
            <div>
              <v-btn
                v-if="task.taskType === TaskType.Team || task.taskStatus === TaskStatus.InProgress"
                color="primary"
                small
                data-test="task-details-action-button"
                @click="showTaskActionDialog = true">
                {{ $t('task.action') }}
              </v-btn>
            </div>
          </v-row>

          <v-row
            v-if="displayWorkingOnIt"
            class="d-flex justify-space-between d-flex working-on-section align-center mx-13 mb-4 mt-0 px-4 pa-1 rc-body14"
            data-test="task-details-working-on-it">
            <v-col cols="4" class="font-weight-bold pa-0">
              {{ $t('task.task_details.working_on_it') }}
            </v-col>
            <v-col class="pa-0 pl-2">
              {{ personIsWorkingOn }}
            </v-col>
            <div>
              <v-switch
                v-model="isWorkingOn"
                color="primary"
                small
                data-test="task-details-working-on-it-toggle"
                class="ma-0"
                :loading="toggleLoading"
                :disabled="toggleLoading"
                @change="onToggleChange($event)" />
            </div>
          </v-row>

          <div class="task-details-container mt-4 mx-13 py-2 rc-body14">
            <template v-if="isTeamTask">
              <v-row class="border-bottom pa-0 px-2 ma-0 pb-1" data-test="task-details-category-section">
                <v-col cols="4" class="font-weight-bold">
                  {{ $t('task.create_edit.task_category') }}
                </v-col>
                <v-col v-if="selectedCategory">
                  <div data-test="task-details-category">
                    {{ selectedCategory.isOther ? task.category.specifiedOther : $m(selectedCategory.name) }}
                  </div>
                  <div v-if="$m(selectedCategory.description)">
                    <v-icon small class="mr-1 pb-1">
                      mdi-alert-circle
                    </v-icon>
                    <span data-test="task-details-category-description"> {{ $m(selectedCategory.description) }}</span>
                  </div>
                </v-col>
                <v-col v-else>
                  <span> {{ $t('common.N/A') }} </span>
                </v-col>
              </v-row>
            </template>

            <v-row v-else class="border-bottom pa-0 px-2 ma-0 pb-1" data-test="task-details-due-date-section">
              <v-col cols="4" class="font-weight-bold d-flex align-center">
                <v-icon color="red">
                  mdi-flag
                </v-icon>
                {{ $t('task.create_edit.due_date') }}
              </v-col>
              <v-col>
                <div data-test="task-details-due-date">
                  {{ helpers.getLocalStringDate(task.dueDate, '', 'PP') }}
                </div>
              </v-col>
            </v-row>

            <v-row class="border-bottom py-2 px-2 ma-0">
              <v-col cols="4" class="font-weight-bold">
                {{ $t('task.task_details.date_added') }}
              </v-col>
              <v-col>
                <div data-test="task-details-date-added">
                  {{ helpers.getLocalStringDate(task.dateAdded, '', 'PP') }}
                </div>
              </v-col>
            </v-row>

            <v-row class="pt-2 px-2 ma-0">
              <v-col cols="4" class="font-weight-bold">
                {{ $t('task.create_edit.task_description') }}
              </v-col>
              <v-col>
                <div class="task-details-description">
                  {{ task.description }}
                </div>
              </v-col>
            </v-row>
          </div>
        </v-container>
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="task_details_back_btn"
        @click="navigateBack">
        {{ $t('task.task_details.back_to_tasks') }}
      </v-btn>
    </template>
    <task-action-dialog v-if="showTaskActionDialog" :task="task" :event-id="caseFile.eventId" :show.sync="showTaskActionDialog" />
    <task-history-dialog v-if="showTaskHistoryDialog" :show.sync="showTaskHistoryDialog" :task-action-histories="task.taskActionHistories" :teams-by-event="teamsByEvent" />
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useTaskStore } from '@/pinia/task/task';
import { TaskStatus, TaskType } from '@libs/entities-lib/task';
import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import caseFileTask from '@/ui/mixins/caseFileTask';
import mixins from 'vue-typed-mixins';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { ITeamEntity } from '@libs/entities-lib/team';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import TaskActionDialog from '@/ui/views/pages/case-files/details/case-file-task/components/TaskActionDialog.vue';
import TaskHistoryDialog from '@/ui/views/pages/case-files/details/case-file-task/components/TaskHistoryDialog.vue';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileTask, caseFileDetail).extend({
  name: 'TaskDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcPageLoading,
    TaskActionDialog,
    TaskHistoryDialog,
  },

  props: {
    taskId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      TaskType,
      UserRoles,
      TaskStatus,
      helpers,
      showTaskActionDialog: false,
      showTaskHistoryDialog: false,
      loading: false,
      assignedTeam: null as ITeamEntity,
      teamsByEvent: [] as ITeamEntity[],
    };
  },

  computed: {
    title(): string {
      return this.task?.taskType === TaskType.Team
        ? this.$t('task.task_details.title.team_task_details') as string
        : this.$t('task.task_details.title.personal_task_details') as string;
    },

    isTeamTask(): boolean {
      return this.task.taskType === TaskType.Team;
    },

    displayedTaskName(): string {
      if (this.isTeamTask) {
        return this.$m(this.selectedTaskName?.name) || '';
      }
      return this.task?.name?.specifiedOther || '';
    },

    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(this.task.createdBy);
    },

    assignedToPerson(): string | TranslateResult {
      const userId = useUserStore().getUserId();
      if (userId === this.task.createdBy) {
        return this.$t('task.create_edit.assigned_to.me');
      }
      if (this.$hasLevel(UserRoles.level5)) {
        return this.userAccountMetadata.displayName;
      }
      return '';
    },

    teamTaskCreatorInfo(): TranslateResult {
      const user = ` ${this.userAccountMetadata.displayName}`;
      const role = ` (${this.$m(this.userAccountMetadata.roleName)})`;
      let creatorInfo = this.$t('task.task_details.by');
      creatorInfo += user;
      creatorInfo += role;
      return creatorInfo;
    },

    canEdit(): boolean {
      if (this.$hasLevel(UserRoles.level6)) {
        return true;
      }
      const userId = useUserStore().getUserId();
      if (this.isTeamTask) {
        if (this.task.taskStatus === TaskStatus.InProgress) {
          return this.$hasLevel(UserRoles.level1) || this.task.createdBy === userId;
        }
      } else {
        return this.task.createdBy === userId;
      }
      return false;
    },

    displayWorkingOnIt(): boolean {
      return this.isTeamTask && this.task.taskStatus === TaskStatus.InProgress;
    },
  },

  watch: {
    'task.assignedTeamId': {
       handler() {
        this.assignedTeam = this.teamsByEvent.filter((t) => t.id === this.task.assignedTeamId)[0];
        this.isWorkingOn = false;
      },
    },
  },

  async created() {
    this.loading = true;
    this.filterOutInactiveTaskNameAndCategory = false;
    await useTaskStore().fetch({ id: this.taskId, caseFileId: this.id });
    await useTaskStore().fetchTaskCategories();
    if (this.isTeamTask) {
      await Promise.all([
        useUserAccountMetadataStore().fetch(this.task.createdBy, false),
        this.getTeamsByEventAndStoreAssignedTeam(),
      ]);
      this.selectedTaskNameId = this.task.name?.optionItemId;
      this.selectedCategoryId = this.task.category ? this.task.category.optionItemId : '';
      this.isWorkingOn = !!this.task.userWorkingOn;
      if (this.isWorkingOn) {
        await useUserAccountMetadataStore().fetch(this.task.userWorkingOn, false);
      }
    } else if (this.$hasLevel(UserRoles.level5)) {
      await useUserAccountMetadataStore().fetch(this.task.createdBy, false);
    }
    this.loading = false;
  },

  methods: {
    navigateBack() {
      this.$router.push({ name: routes.caseFile.task.home.name });
    },

    getEditTaskRoute() {
      this.$router.push({
        name: routes.caseFile.task.edit.name,
        params: {
          id: this.task.caseFileId,
          taskId: this.task.id,
          taskType: this.task.taskType === TaskType.Team ? 'team' : 'personal',
        },
      });
    },

    async getTeamsByEventAndStoreAssignedTeam() {
      const res = await this.$services.teams.getTeamsByEvent(this.caseFile.eventId);
      if (res) {
        this.teamsByEvent = res;
        this.assignedTeam = res.filter((t) => t.id === this.task.assignedTeamId)[0];
      }
    },
  },
});
</script>

<style scoped lang="scss">
.grey-text{
  color: var(--v-grey-darken2)
}

.assigned-to-action {
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
}

.assigned-to-action-team-task {
  background-color: var(--v-grey-lighten4);
  border-radius: 4px 4px 0px 0px;
}

.working-on-section {
  border-top: solid 1px var(--v-grey-lighten2);
  background-color: var(--v-grey-lighten4);
  border-radius: 0px 0px 4px 4px;
}

.task-details-container {
  border-radius: 4px;
  border: 1px solid var(--v-grey-lighten3);
  box-sizing: border-box;
}

.border-bottom {
  border-bottom: 1px solid var(--v-grey-lighten3);
}

.creator-info {
  margin-top: -20px;
}

.task-details-description {
  white-space: pre-line;
}

</style>
