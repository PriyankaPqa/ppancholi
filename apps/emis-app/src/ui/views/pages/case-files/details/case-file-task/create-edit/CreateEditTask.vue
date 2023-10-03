<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <page-template ref="pageTemplate" :show-left-menu="false" :loading="loading">
      <rc-page-content :title="isEditMode ? $t(`task.edit.title.${taskType}`) : $t(`task.create.title.${taskType}`)" :show-help="false">
        <team-task-form
          v-if="taskType === 'team'"
          :id="id"
          :task.sync="task"
          :is-edit-mode="isEditMode"
          :assigned-team-name="assignedTeamName"
          @reset-form-validation="resetFormValidation()" />

        <personal-task-form
          v-else
          :id="id"
          :task.sync="task"
          :is-edit-mode="isEditMode" />

        <template slot="actions">
          <v-btn data-test="cancel-button" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save-button" :loading="isSubmitting" :disabled="failed || (isEditMode && !isDirty) || loading" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">

import { RcPageContent, VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import VDateFieldWithValidation from '@libs/component-lib/components/atoms/VDateFieldWithValidation.vue';
import routes from '@/constants/routes';
import { TranslateResult } from 'vue-i18n';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { ITaskEntityData, TaskStatus, TaskType } from '@libs/entities-lib/task/task.types';
import { TaskEntity } from '@libs/entities-lib/task/task';
import { IServerError, VForm } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';
import _cloneDeep from 'lodash/cloneDeep';
import { mockPersonalTaskEntity } from '@libs/entities-lib/task';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import _isEqual from 'lodash/isEqual';
import { NavigationGuardNext, Route } from 'vue-router';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import caseFileTask from '@/ui/mixins/caseFileTask';
import TeamTaskForm from '@/ui/views/pages/case-files/details/case-file-task/create-edit/TeamTaskForm.vue';
import PersonalTaskForm from '@/ui/views/pages/case-files/details/case-file-task/create-edit/PersonalTaskForm.vue';

export default mixins(caseFileDetail, handleUniqueNameSubmitError, caseFileTask).extend({
  name: 'CreateEditTask',

  components: {
    VSelectWithValidation,
    VTextAreaWithValidation,
    VTextFieldWithValidation,
    VDateFieldWithValidation,
    PageTemplate,
    RcPageContent,
    StatusChip,
    TeamTaskForm,
    PersonalTaskForm,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    // TODO need to complete this and add unit test in Edit Task 3204

    if (this.isEditMode && !this.isDirty) {
      next();
    }

      if (this.isEditMode && this.isDirty) {
        const leavingConfirmed = await this.$confirm({
        title: this.$t('confirmLeaveDialog.title'),
        messages: this.$t('confirmLeaveDialog.message_1'),
      });

      if (leavingConfirmed) {
        next();
      }
    } else if (!this.isEditMode) {
        next();
    }
  },

  props: {
    // case file id
    id: {
      type: String,
      required: true,
    },

    taskType: {
      type: String,
      default: '',
    },

    taskId: {
      type: String,
      default: '',
    },
  },

    data() {
    return {
      loading: false,
      isSubmitting: false,
      task: new TaskEntity(),
      backupTask: null as ITaskEntityData,
      assignedTeamName: '',
      TaskType,
    };
  },

  computed: {
    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    isEditMode(): boolean {
      // TODO add unit test in the ticket Edit Task
      return this.$route.name === routes.caseFile.task.edit.name;
    },

    isDirty(): boolean {
      // TODO add unit test in the ticket Edit Task
      return !_isEqual(this.task, this.backupTask);
    },
  },

  async created() {
    if (this.isEditMode) {
      // TODO load task data and backup original task
      await this.loadTask();
    } else {
      this.prepareCreateTask();
      if (this.task.taskType === TaskType.Team) {
        await this.fetchEscalationTeamAndSetTeamId();
      }
    }
  },

  methods: {
    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    back(): void {
      this.$router.replace({ name: routes.caseFile.task.home.name });
    },

    async submitCreateTask() {
      if (this.taskType === 'team' && !this.task.assignedTeamId) {
        this.$toasted.global.error(this.$t('task.error.escalation_team_is_not_available_for_the_event'));
        return;
      }
      try {
        this.isSubmitting = true;
        const res = await useTaskStore().createTask(this.task);
        if (res) {
          const message: TranslateResult = res.taskType === TaskType.Team
            ? this.$t('task.team_task_created')
            : this.$t('task.personal_task_created');

          this.$toasted.global.success(message);
          await this.$router.replace({ name: routes.caseFile.task.details.name, params: { taskId: res.id } });
        }

        this.resetFormValidation();
      } catch (e) {
        this.$appInsights.trackTrace('Task submit error', { error: (e as IServerError).response?.data?.errors }, 'CreateEditTask', 'submit');
        this.handleSubmitError(e);
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditTask() {
      // TODO add unit test in ticket Edit Task
      try {
        this.isSubmitting = true;
        const res = await useTaskStore().editTask(this.taskId, this.task);

        if (res) {
          this.$toasted.global.success(this.$t('task.task_edited'));
        }

        // TODO router jump to task details

        this.resetFormValidation();
      } catch (e) {
        // TODO handle error

      } finally {
        this.isSubmitting = false;
      }
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        return;
      }

      if (this.isEditMode) {
        await this.submitEditTask();
      } else {
        await this.submitCreateTask();
      }
    },

    prepareCreateTask() {
      const task = new TaskEntity();
        task.caseFileId = this.id;
        task.taskType = this.taskType === 'team' ? TaskType.Team : TaskType.Personal;
        task.taskStatus = TaskStatus.InProgress;
      this.task = task;
    },

    async fetchEscalationTeamAndSetTeamId() {
      const teamsOfEvent = await this.$services.teams.getTeamsByEvent(this.caseFile.eventId);
      if (teamsOfEvent) {
        const escalationTeam = teamsOfEvent.filter((t) => t.isEscalation)[0];
        this.assignedTeamName = escalationTeam?.name;
        this.task.assignedTeamId = escalationTeam?.id;
      }
    },

    async loadTask() {
      // TODO complete this function in Edit Task
      // if (this.taskId) {
      //   await useTaskStore().fetch(this.taskId);
      // }
      // const storeTaskEntityData = _cloneDeep(useTaskStore().getById(this.taskId));
      // this.task = new TaskEntity(storeTaskEntityData);
      // this.backupTask = new TaskEntity(storeTaskEntityData);

      // TODO remove mock
      // const mockTeamTask: ITaskEntityData = {
      //   ...mockTeamTaskEntity(),
      //   isUrgent: true,
      //   taskName: 'mock-id-1',
      //   categoryId: 'mock-id-2',
      //   taskStatus: TaskStatus.Completed,
      // };

      const mockPersonalTask: ITaskEntityData = {
        ...mockPersonalTaskEntity(),
        dueDate: '2023-09-01',
      };
          this.task = new TaskEntity(_cloneDeep(mockPersonalTask));
          this.backupTask = new TaskEntity(_cloneDeep(mockPersonalTask));

      // TODO set taskType when refresh edit page
    },
  },
});
</script>
