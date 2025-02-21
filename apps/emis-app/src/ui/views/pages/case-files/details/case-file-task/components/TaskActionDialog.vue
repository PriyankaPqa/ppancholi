<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('task.task_action_dialog.task_action')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed || submitLoading"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      :min-height="showAssignTeamSelect ? 500 : 360"
      :loading="loading"
      data-test="task-action-dialog"
      @cancel="$emit('update:show', false);"
      @close="$emit('update:show', false);"
      @submit="onSubmit">
      <div class="px-0">
        <div v-if="task.taskType === TaskType.Team" class="mb-10" data-test="task-action-dialog-team-task-info">
          <div v-if="selectedTaskCategoryName" class="font-weight-bold rc-heading-5">
            {{ helpers.capitalize(selectedTaskCategoryName) }}
          </div>
          <div class="creator-info grey-darken-2 rc-body12 mb-3">
            {{ teamTaskCreatorInfo }}
          </div>
          <v-row class="justify-center mt-0 rc-body14 px-3">
            <v-col cols="12" class="border-all border-radius-6 pa-0">
              <v-row v-if="task.financialAssistancePaymentId" class="border-bottom ma-0 px-2" data-test="task-action-dialog-sub-category">
                <v-col cols="4" class="font-weight-bold">
                  {{ $t('caseFileActivity.activityList.title.FinancialAssistancePayment') }}
                </v-col>
                <v-col cols="8">
                  <span>
                    {{ financialAssistancePaymentName }}
                  </span>
                </v-col>
              </v-row>
              <v-row v-if="selectedSubCategoryName" class="border-bottom ma-0 px-2" data-test="task-action-dialog-sub-category">
                <v-col cols="4" class="font-weight-bold">
                  {{ $t('task.task_sub_category') }}
                </v-col>
                <v-col cols="8">
                  {{ selectedSubCategoryName }}
                </v-col>
              </v-row>
              <v-row class="ma-0 flex-nowrap flex px-2" data-test="task-action-dialog-description">
                <v-col cols="4" class="font-weight-bold">
                  {{ $t('task.create_edit.task_description') }}
                </v-col>
                <v-col cols="8">
                  {{ task.description }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
        <div class="mb-8 py-5" :class="{ 'action-select-bg': actionItems.length === 1 }">
          <validation-provider v-slot="{ errors }" :rules="rules.actionTaken">
            <v-radio-group
              v-model="actionTaken"
              :error-messages="errors"
              class="mt-0"
              data-test="action-radio-group"
              @change="resetForm()">
              <div class="d-flex flex-nowrap">
                <div v-for="(item, $index) in actionItems" :key="$index" class="mx-1 py-2" :class="{ 'action-select-radio': actionItems.length > 1 }">
                  <v-radio :value="item.value" :data-test="`task-action-dialog-radio-${item.label}`" :class="{ 'flex-column': actionItems.length > 1 } ">
                    <template #label>
                      <div class="font-weight-bold" :data-test="`task-action-dialog-radio-label-${item.label}`">
                        {{ item.label }}
                      </div>
                    </template>
                  </v-radio>
                  <div v-if="item.description" class="rc-body12 px-2 text-center" :data-test="`task-action-dialog-radio-description-${item.label}`">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </v-radio-group>
          </validation-provider>
        </div>

        <div v-if="showAssignTeamSelect" class="py-0">
          <v-select-with-validation
            v-model="assignedTeamId"
            :items="availableTeams"
            :item-text="(item) => item.name"
            :item-value="(item) => item.id"
            :label="`${$t('task.action.select_team_to_assign')} *`"
            :rules="rules.teamAssignTo"
            :disabled="task.taskStatus === TaskStatus.Cancelled"
            data-test="task-action-dialog-team-assign-to" />
        </div>

        <div class="pa-0">
          <v-text-area-with-validation
            v-model="rationale"
            :label="`${$t('task.task_action_dialog.rationale_for_decision')} *`"
            rows="4"
            data-test="task-action-dialog-rationale"
            :rules="rules.rationale" />
        </div>
      </div>
    </rc-dialog>
  </validation-observer>
</template>
<script lang="ts">

import { RcDialog, VSelectWithValidation, VTextAreaWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { TaskActionTaken, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { ValidationProvider } from 'vee-validate';
import { VForm } from '@libs/shared-lib/types';
import { TranslateResult } from 'vue-i18n';
import { useTaskStore } from '@/pinia/task/task';
import helpers from '@/ui/helpers/helpers';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { GlobalHandler } from '@libs/services-lib/http-client';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import caseFileTask from '@/ui/mixins/caseFileTask';
import mixins from 'vue-typed-mixins';
import { UserRoles } from '@libs/entities-lib/user';
import { ITeamEntity } from '@libs/entities-lib/team';

interface IActionItem {
  value: TaskActionTaken;
  label: TranslateResult;
  description: TranslateResult | string;
}

export default mixins(caseFileTask).extend({
  name: 'TaskActionDialog',

  components: {
    RcDialog,
    VTextAreaWithValidation,
    ValidationProvider,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    eventId: {
      type: String,
      required: true,
    },

    financialAssistancePaymentNameProp: {
      type: String,
      default: '',
    },

    selectedTaskCategoryName: {
      type: String,
      default: '',
    },

    selectedSubCategoryName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      rationale: '',
      actionTaken: null as TaskActionTaken,
      assignedTeamId: '',
      submitLoading: false,
      loading: false,
      TaskType,
      helpers,
      TaskStatus,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        rationale: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        actionTaken: {
          required: true,
        },
        teamAssignTo: {
          required: true,
        },
      };
    },

    actionItems(): IActionItem[] {
      if (this.task.taskStatus === TaskStatus.Completed || this.task.taskStatus === TaskStatus.Cancelled) {
        return [
          {
            value: TaskActionTaken.Reopen,
            label: this.$t('task.task_action_dialog.Reopen'),
            description: '',
          },
        ];
      }

      if (this.task.taskType === TaskType.Team) {
         const isCreator = this.task.createdBy === this.userId;
         const hasAccess = this.$hasLevel(UserRoles.level6) || this.isInAssignedTeam;

         const canCancel = this.task.taskStatus === TaskStatus.New && (isCreator || this.$hasLevel(UserRoles.level6) || this.userIsInEscalationTeam);

        const actions = [{
            value: TaskActionTaken.Assign,
            label: this.$t('task.task_action_dialog.Assign'),
            description: this.$t('task.task_action_dialog.Assign.description'),
          },
          {
            value: TaskActionTaken.ActionCompleted,
            label: this.$t('task.task_action_dialog.ActionCompleted'),
            description: this.$t('task.task_action_dialog.ActionCompleted.description'),
          },
          {
            value: TaskActionTaken.TaskCompleted,
            label: this.$t('task.task_action_dialog.TaskCompleted'),
            description: this.$t('task.task_action_dialog.TaskCompleted.description'),
          }];

          const cancel = {
            value: TaskActionTaken.Cancelled,
            label: this.$t('task.task_action_dialog.Cancelled'),
            description: this.$t('task.task_action_dialog.Cancelled.description'),
          };

          if (!hasAccess && canCancel) {
            return [cancel];
          }

          if (hasAccess && !canCancel) {
            return actions;
          }

          if (hasAccess && canCancel) {
            return [...actions, cancel];
          }

          return [];
      }
      return [
        {
          value: TaskActionTaken.TaskCompleted,
          label: this.$t('task.task_action_dialog.personal_task.TaskCompleted'),
          description: '',
        },
        {
          value: TaskActionTaken.Cancelled,
          label: this.$t('task.task_action_dialog.Cancelled'),
          description: this.$t('task.task_action_dialog.Cancelled.description'),
        },
      ];
    },

    showAssignTeamSelect(): boolean {
      const actionAssignTeam = [TaskActionTaken.Assign, TaskActionTaken.ActionCompleted, TaskActionTaken.Reopen];
      return this.task.taskType === TaskType.Team && actionAssignTeam.indexOf(this.actionTaken) >= 0;
    },

    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(this.task.createdBy);
    },

    teamTaskCreatorInfo(): TranslateResult {
      const user = ` ${this.userAccountMetadata.displayName}`;
      const role = ` (${this.$m(this.userAccountMetadata.roleName)})`;
      let creatorInfo = this.$t('task.task_details.by');
      creatorInfo += user;
      creatorInfo += role;
      return creatorInfo;
    },

    availableTeams(): ITeamEntity[] {
      if (this.task.taskStatus === TaskStatus.Cancelled) {
        const escalationTeam = this.assignableTeams.filter((t) => t.isEscalation)[0];
        if (escalationTeam) {
          this.assignedTeamId = escalationTeam.id;
          return [escalationTeam];
        }
        return [];
      }
      if (this.actionTaken !== TaskActionTaken.Reopen) {
        return this.assignableTeams.filter((t) => t.id !== this.task.assignedTeamId);
      }
      return this.assignableTeams;
    },
  },

  async created() {
    if (this.task.taskType === TaskType.Team) {
      this.financialAssistancePaymentName = this.financialAssistancePaymentNameProp;
      try {
        this.loading = true;
        await Promise.all([
          useUserAccountMetadataStore().fetch(this.task.createdBy, GlobalHandler.Partial),
          this.getAssignableTeams(),
          !this.financialAssistancePaymentName && this.task?.financialAssistancePaymentId && this.fetchSelectedFAPaymentAndSetName(),
        ]);
      } finally {
        this.loading = false;
      }
    }
  },

  methods: {

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        if (this.availableTeams.length === 0 && this.task.taskStatus === TaskStatus.Cancelled) {
          this.$toasted.global.error(this.$t('task.error.escalation_team_is_not_available_for_the_event'));
        }
        return;
      }
      this.submitLoading = true;
      try {
        await useTaskStore().taskAction(
          this.task.id,
          this.task.caseFileId,
          { actionType: this.actionTaken, rationale: this.rationale, teamId: this.assignedTeamId, taskStatus: this.task.taskStatus },
        );
      } finally {
        this.$emit('update:show', false);
      }
      this.submitLoading = false;
    },

    resetForm() {
      this.rationale = '';
      this.assignedTeamId = '';
      (this.$refs.form as VForm).reset();
    },
  },
});
</script>

<style scoped lang="scss">
.action-select-radio{
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
  width: 25%;
}

.action-select-bg{
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
  padding-left: 16px;
  width: 100%;
}

.border-bottom {
  border-bottom: 1px solid var(--v-grey-lighten3);
}

.border-radius-6 {
  border-radius: 6px;
}

.flex-column {
  display: flex !important;
  flex-direction: column;
}
</style>
