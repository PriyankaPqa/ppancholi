<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <page-template ref="pageTemplate" :show-left-menu="false" :loading="loading">
      <rc-page-content
        :title="isEditMode ? $t(`task.edit.title.${taskType}`) : $t(`task.create.title.${taskType}`)"
        :show-help="false"
        :show-title="!dialogMode"
        :fullscreen="dialogMode">
        <v-row class="justify-center">
          <v-col cols="12" :lg="dialogMode ? 12 : 7">
            <v-container :class="dialogMode ? '' : 'my-8'">
              <team-task-form
                v-if="taskType === 'team'"
                :case-file-id="id"
                :task-data.sync="localTask"
                :is-edit-mode="isEditMode"
                :lock-category="isLodgingTask"
                @reset-form-validation="resetFormValidation()">
                <template #actionSection>
                  <v-row
                    class="justify-space-between align-center ml-0 pr-4 mr-0"
                    :class="{ 'assigned-to-action-team-task mb-0': displayWorkingOnIt, 'assigned-to-action mb-6': !displayWorkingOnIt }">
                    <v-col cols="4" class="font-weight-bold">
                      {{ $t('task.create_edit.assigned_to') }}
                    </v-col>
                    <v-col class=" pa-0 pl-4" data-test="task-assigned-to">
                      {{ assignedTeam ? assignedTeam.name : '' }}
                    </v-col>
                    <div v-if="isEditMode" class="pl-0 py-2">
                      <v-btn
                        color="primary"
                        small
                        :disabled="!canAction"
                        @click="showTaskActionDialog = true">
                        {{ $t('task.action') }}
                      </v-btn>
                    </div>
                  </v-row>

                  <v-row
                    v-if="displayWorkingOnIt"
                    class="d-flex justify-space-between d-flex working-on-section align-center mx-0 mb-6 mt-0 px-4 pa-1 rc-body14"
                    data-test="working-on-it">
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
                        data-test="working-on-it-toggle"
                        :aria-label="$t('task.task_details.working_on_it')"
                        class="ma-0"
                        :loading="toggleLoading"
                        :disabled="toggleLoading || !canToggleIsWorkingOn"
                        @change="onToggleChange($event)" />
                    </div>
                  </v-row>
                </template>
              </team-task-form>

              <personal-task-form
                v-else
                :id="id"
                :task-data.sync="localTask"
                :is-edit-mode="isEditMode">
                <template #actionSection>
                  <v-row class="assigned-to-action justify-space-between align-center mb-6 ml-0 pr-4 mr-0">
                    <div class="pl-4 py-2">
                      <span class="font-weight-bold">
                        {{ $t('task.create_edit.assigned_to') }}
                      </span>
                      <span data-test="task-assigned-to">
                        {{ isEditMode ? assignedToPerson : $t('task.create_edit.assigned_to.me') }}
                      </span>
                    </div>
                    <div v-if="isEditMode" class="pl-0 py-2">
                      <v-btn
                        v-if="task.taskStatus === TaskStatus.InProgress"
                        color="primary"
                        small
                        @click="showTaskActionDialog = true">
                        {{ $t('task.action') }}
                      </v-btn>
                    </div>
                  </v-row>
                </template>
              </personal-task-form>
            </v-container>
          </v-col>
        </v-row>

        <template slot="actions">
          <v-btn data-test="cancel-button" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save-button" :loading="isSubmitting" :disabled="failed || (isEditMode && !isDirty) || loading" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
      <task-action-dialog
        v-if="showTaskActionDialog"
        :task-id="taskId"
        :selected-task-category-name="displayedTaskCategory"
        :selected-sub-category-name="displayedSubCategory"
        :event-id="caseFile.eventId"
        :show.sync="showTaskActionDialog" />
    </page-template>
  </validation-observer>
</template>

<script lang="ts">

import { RcPageContent, VSelectWithValidation, VTextAreaWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import VDateFieldWithValidation from '@libs/component-lib/components/atoms/VDateFieldWithValidation.vue';
import routes from '@/constants/routes';
import { TranslateResult } from 'vue-i18n';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { IUpdateTaskRequest, TaskStatus, TaskType } from '@libs/entities-lib/task/task.types';
import { TaskEntity } from '@libs/entities-lib/task/task';
import { IListOption, VForm } from '@libs/shared-lib/types';
import { useTaskStore } from '@/pinia/task/task';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import _isEqual from 'lodash/isEqual';
import { NavigationGuardNext, Route } from 'vue-router';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import caseFileTask from '@/ui/mixins/caseFileTask';
import TeamTaskForm from '@/ui/views/pages/case-files/details/case-file-task/create-edit/TeamTaskForm.vue';
import PersonalTaskForm from '@/ui/views/pages/case-files/details/case-file-task/create-edit/PersonalTaskForm.vue';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@/ui/helpers/helpers';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import TaskActionDialog from '@/ui/views/pages/case-files/details/case-file-task/components/TaskActionDialog.vue';
import { useTeamStore } from '@/pinia/team/team';
import { GlobalHandler } from '@libs/services-lib/http-client';

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
    TaskActionDialog,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
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
    dialogMode: {
      type: Boolean,
      default: false,
    },

    taskType: {
      type: String,
      default: '',
    },

    isLodgingTask: {
      type: Boolean,
      default: false,
    },
  },

    data() {
    return {
      loading: false,
      isSubmitting: false,
      showTaskActionDialog: false,
      TaskType,
      TaskStatus,
      UserRoles,
      originalForm: {
        category: null as IListOption,
        subCategory: null as IListOption,
        description: '',
        dueDate: '' as string | Date,
        isUrgent: false,
        financialAssistancePaymentId: '',
      },
    };
  },

  computed: {
    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.task.edit.name;
    },

    isDirty(): boolean {
      return !_isEqual(this.originalForm, {
        category: this.localTask.category,
        subCategory: this.localTask.subCategory,
        description: this.localTask.description,
        dueDate: helpers.getLocalStringDate(this.localTask.dueDate, 'Task.dueDate'),
        isUrgent: this.localTask.isUrgent,
        financialAssistancePaymentId: this.localTask.financialAssistancePaymentId,
      });
    },

    displayWorkingOnIt(): boolean {
      return this.task.taskType === TaskType.Team && this.isEditMode && (this.task.taskStatus === TaskStatus.InProgress || this.task.taskStatus === TaskStatus.New);
    },

    assignedToPerson(): string | TranslateResult {
      if (this.userId === this.task.createdBy) {
        return this.$t('task.create_edit.assigned_to.me');
      }
      if (this.$hasLevel(UserRoles.level6)) {
        const userAccountMetadata = useUserAccountMetadataStore().getById(this.task.createdBy);
        return userAccountMetadata.displayName;
      }
      return '';
    },

    displayedTaskCategory(): string {
      if (this.taskType === 'team') {
        return this.$m(this.selectedTaskCategory?.name) || '';
      }
      return this.localTask?.category?.specifiedOther || '';
    },

    displayedSubCategory(): string {
      return this.selectedSubCategory?.isOther ? this.localTask.subCategory.specifiedOther : this.$m(this.selectedSubCategory?.name);
    },
  },

  watch: {
    'task.userWorkingOn': {
      handler(newValue: string) {
        this.localTask.userWorkingOn = newValue;
      },
    },

    'task.taskStatus': {
      handler(newValue: TaskStatus) {
        this.localTask.taskStatus = newValue;
      },
    },

    'task.assignedTeamId': {
      async handler(newValue) {
        this.isWorkingOn = false;
        useTeamStore().fetchByIds([newValue], true);
      },
    },
  },

  async created() {
    this.loading = true;
    if (this.isEditMode) {
      await this.loadTask();
      this.setOriginalData();
    } else {
      await this.prepareCreateTask();
    }
    if (this.taskType === 'team') {
      await this.fetchAssignedTeam();
    }
    this.loading = false;
  },

  methods: {
    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    back(): void {
      if (this.dialogMode) {
        this.$emit('cancel');
      } else {
        this.$router.replace({ name: routes.caseFile.task.home.name });
      }
    },

    setOriginalData() {
      this.originalForm = _cloneDeep({
        category: this.localTask.category,
        subCategory: this.localTask.subCategory,
        description: this.localTask.description,
        dueDate: helpers.getLocalStringDate(this.localTask.dueDate, 'Task.dueDate'),
        isUrgent: this.localTask.isUrgent,
        financialAssistancePaymentId: this.localTask.financialAssistancePaymentId,
      });
    },

    async submitCreateTask() {
      if (this.taskType === 'team' && !this.localTask.assignedTeamId) {
        this.$toasted.global.error(this.$t('task.error.escalation_team_is_not_available_for_the_event'));
        return;
      }
      try {
        this.isSubmitting = true;
        const res = await useTaskStore().createTask(this.localTask, this.isLodgingTask);
        if (res) {
          if (this.dialogMode) {
            this.$emit('saved');
          } else {
            const message: TranslateResult = res.taskType === TaskType.Team
              ? this.$t('task.team_task_created')
              : this.$t('task.personal_task_created');

            this.$toasted.global.success(message);

            await this.$router.replace({ name: routes.caseFile.task.details.name, params: { taskId: res.id } });
          }
        }

        this.resetFormValidation();
      } catch (e) {
        this.handleSubmitError(e);
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditTask() {
      try {
        this.isSubmitting = true;
        const updateTaskRequest: IUpdateTaskRequest = {
          isUrgent: this.localTask.isUrgent,
          assignedTeamId: this.localTask.assignedTeamId,
          dueDate: this.localTask.dueDate,
          category: this.localTask.category,
          subCategory: this.localTask.subCategory,
          description: this.localTask.description,
          financialAssistancePaymentId: this.localTask.financialAssistancePaymentId,
          caseFileId: this.localTask.caseFileId,
        };
        const res = await useTaskStore().editTask(this.taskId, updateTaskRequest);

        if (res) {
          this.$toasted.global.success(this.$t('task.task_edited'));
        }
        this.setOriginalData();
        await this.$router.replace({ name: routes.caseFile.task.details.name, params: { taskId: res.id } });

        this.resetFormValidation();
      } catch (e) {
        this.handleSubmitError(e);
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

    async prepareCreateTask() {
      const task = new TaskEntity();
      task.caseFileId = this.id;
      task.taskType = this.taskType === 'team' ? TaskType.Team : TaskType.Personal;
      task.taskStatus = TaskStatus.InProgress;
      if (this.isLodgingTask) {
        const categ = (await useTaskStore().fetchTaskCategories()).find((c) => c.isLodging);
        if (categ) {
          task.category = { optionItemId: categ.id, specifiedOther: null };
          this.selectedTaskCategoryId = categ.id;
        }
      }
      this.localTask = task;
    },

    async fetchAssignedTeam() {
      if (!this.isEditMode) {
        const params = this.isLodgingTask ? { eventId: this.caseFile.eventId, isLodging: true } : { eventId: this.caseFile.eventId, isEscalation: true };
        const defaultTeamResult = await useTeamStore().getTeamsByEvent(params);
        this.localTask.assignedTeamId = defaultTeamResult?.[0]?.id;
      } else {
        await useTeamStore().fetchByIds([this.task.assignedTeamId], true);
        this.localTask.assignedTeamId = this.task.assignedTeamId;
      }
    },

    async loadTask() {
        const res = await useTaskStore().fetch({ id: this.taskId, caseFileId: this.id });
        if (res) {
          this.localTask = new TaskEntity(this.task);
          if (this.taskType === 'team') {
            this.isWorkingOn = !!this.task.userWorkingOn;
            this.selectedTaskCategoryId = this.task.category.optionItemId;
            this.selectedSubCategoryId = this.task.subCategory ? this.task.subCategory.optionItemId : '';
            if (this.isWorkingOn) {
              useUserAccountMetadataStore().fetch(this.task.userWorkingOn, GlobalHandler.Partial);
            }
          } else if (this.userId !== this.task.createdBy) {
              await useUserAccountMetadataStore().fetch(this.task.createdBy, GlobalHandler.Partial);
            }
        }
    },
  },
});
</script>

<style scoped lang="scss">

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

</style>
