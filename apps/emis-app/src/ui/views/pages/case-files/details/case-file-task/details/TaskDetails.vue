<template>
  <rc-page-content
    :title="title"
    show-back-button
    @back="navigateBack">
    <rc-page-loading v-if="loading" />
    <v-container v-else class="px-16 pt-8">
      <v-row class="px-16 mb-5 justify-space-between flex-nowrap">
        <div class="font-weight-bold rc-heading-4">
          {{ helpers.capitalize(displayedTaskName) }}
        </div>
        <div class="d-flex align-center">
          <template v-if="isTeamTask && task.isUrgent">
            <span class="red--text font-weight-bold" data-test="task-details-is-urgent">{{ $t('task.create_edit.urgent') }}</span>
            <v-divider vertical class="ml-4" />
          </template>

          <v-btn icon color="primary" class="mx-2">
            <v-icon>
              mdi-history
            </v-icon>
          </v-btn>

          <status-chip v-if="isTeamTask" status-name="TaskStatus" :status="task.taskStatus" class="mr-4" />
          <template v-if="canEdit">
            <v-divider vertical class="mr-2" />
            <v-btn icon data-test="task-details-edit-button">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>
          </template>
        </div>
      </v-row>
      <template v-if="isTeamTask">
        <div class="creator-info px-13 grey--text rc-body14" data-test="task-details-team-task-creator-info">
          {{ teamTaskCreatorInfo }}
        </div>
        <div v-if="selectedTaskName && $m(selectedTaskName.description)" class="px-13 mt-2 grey-text rc-body16">
          <v-icon small class="mr-1 pb-1">
            mdi-alert-circle
          </v-icon>
          <span data-test="task-details-team-task-name-description"> {{ $m(selectedTaskName.description) }} </span>
        </div>
      </template>

      <v-row class="pl-4 py-2 d-flex justify-space-between d-flex assigned-to-action align-center mx-13 mb-4 mt-4 pr-4 pa-0">
        <v-col cols="4" class="font-weight-bold pa-0">
          {{ $t('task.create_edit.assigned_to') }}
        </v-col>
        <v-col class="pa-0 pl-2" data-test="task-details-assigned-to">
          {{ (isTeamTask && assignedTeam) ? assignedTeam.name : $t('task.create_edit.assigned_to.me') }}
        </v-col>
        <div>
          <v-btn
            color="primary"
            small
            data-test="task-details-action-button"
            @click="showTaskActionDialog = true">
            {{ $t('task.action') }}
          </v-btn>
        </div>
      </v-row>

      <div class="task-details-container mt-4 mx-13 py-2">
        <template v-if="isTeamTask">
          <v-row class="border-bottom pa-0 px-2 ma-0 pb-1" data-test="task-details-category-section">
            <v-col cols="4" class="font-weight-bold">
              {{ $t('task.create_edit.task_category') }}
            </v-col>
            <v-col v-if="selectedCategory">
              <div data-test="task-details-category">
                {{ $m(selectedCategory.name) }}
              </div>
              <div v-if="$m(selectedCategory.description)" class="">
                <v-icon small class="mr-1 pb-1">
                  mdi-alert-circle
                </v-icon>
                <span data-test="task-details-category-description"> {{ $m(selectedCategory.description) }}</span>
              </div>
            </v-col>
          </v-row>

          <v-row v-if="task.category && task.category.specifiedOther" class="border-bottom pa-0 px-2 ma-0 pb-1" data-test="task-details-category-specified-other">
            <v-col cols="4" class="font-weight-bold" />
            <v-col>
              <div data-test="task-details-category">
                {{ task.category.specifiedOther }}
              </div>
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
              {{ helpers.getLocalStringDate(task.dueDate, '', 'MMM d, yyyy') }}
            </div>
          </v-col>
        </v-row>

        <v-row class="border-bottom py-2 px-2 ma-0">
          <v-col cols="4" class="font-weight-bold">
            {{ $t('task.task_details.date_added') }}
          </v-col>
          <v-col>
            <div data-test="task-details-date-added">
              {{ helpers.getLocalStringDate(task.dateAdded, '', 'MMM d, yyyy') }}
            </div>
          </v-col>
        </v-row>

        <v-row class="pt-2 px-2 ma-0">
          <v-col cols="4" class="font-weight-bold">
            {{ $t('task.create_edit.task_description') }}
          </v-col>
          <v-col>
            <div>{{ task.description }}</div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useTaskStore } from '@/pinia/task/task';
import { ITaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { TranslateResult } from 'vue-i18n';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import caseFileTask from '@/ui/mixins/caseFileTask';
import mixins from 'vue-typed-mixins';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { ITeamEntity } from '@libs/entities-lib/team';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileTask, caseFileDetail).extend({
  name: 'TaskDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcPageLoading,
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
      helpers,
      showTaskActionDialog: false,
      showTaskHistoryDialog: false,
      loading: false,
      assignedTeam: null as ITeamEntity,
    };
  },

  computed: {
    task(): ITaskEntity {
      return useTaskStore().getById(this.taskId);
    },

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

    teamTaskCreatorInfo(): TranslateResult {
      const userAccountMetadata = useUserAccountMetadataStore().getById(this.task.createdBy);
      const user = ` ${userAccountMetadata.displayName}`;
      const role = ` (${this.$m(userAccountMetadata.roleName)})`;
      let creatorInfo = this.$t('task.task_details.by');
      creatorInfo += user;
      creatorInfo += role;
      return creatorInfo;
    },

    canEdit(): boolean {
      const userId = useUserStore().getUserId();
      if (this.$hasLevel(UserRoles.level6)) {
        return true;
      }
      if (this.isTeamTask) {
        if (this.task.taskStatus === TaskStatus.InProgress) {
          return this.$hasLevel(UserRoles.level1) || this.task.createdBy === userId;
        }
      }
      return this.task.createdBy === userId;
    },
  },

  async created() {
    this.loading = true;
    await useTaskStore().fetch({ id: this.taskId, caseFileId: this.id });
    await useTaskStore().fetchTaskCategories();
    if (this.isTeamTask) {
      await Promise.all([useUserAccountMetadataStore().fetch(this.task.createdBy, false), this.getAssignedTeam()]);
      this.selectedTaskNameId = this.task.name?.optionItemId;
      this.selectedCategoryId = this.task.category ? this.task.category.optionItemId : '';
    }
    this.loading = false;
  },

  methods: {
    navigateBack() {
      this.$router.push({ name: routes.caseFile.task.home.name });
    },

    async getAssignedTeam() {
      const res = await this.$services.teams.getTeamsByEvent(this.caseFile.eventId, this.task.assignedTeamId);
      if (res) {
        this.assignedTeam = res[0];
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

</style>
