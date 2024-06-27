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
          <div v-if="selectedTaskCategory" class="font-weight-bold rc-heading-5">
            {{ helpers.capitalize(selectedTaskCategory) }}
          </div>
          <div class="creator-info grey-darken-2 rc-body12 mb-3">
            {{ teamTaskCreatorInfo }}
          </div>
          <v-row class="justify-center mt-0 rc-body14 px-3">
            <v-col cols="12" class="border-all border-radius-6 pa-0">
              <v-row v-if="selectedSubCategory" class="border-bottom ma-0 px-2" data-test="task-action-dialog-sub-category">
                <v-col cols="3" class="font-weight-bold">
                  {{ $t('task.create_edit.task_category') }}
                </v-col>
                <v-col cols="9">
                  {{ selectedSubCategory }}
                </v-col>
              </v-row>
              <v-row class="ma-0 flex-nowrap flex px-2">
                <v-col cols="3" class="font-weight-bold">
                  {{ $t('task.create_edit.task_description') }}
                </v-col>
                <v-col cols="9">
                  {{ task.description }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
        <div class="action-select-area mb-8 py-5">
          <validation-provider v-slot="{ errors }" :rules="rules.actionTaken">
            <v-radio-group
              v-model="actionTaken"
              :error-messages="errors"
              class="mt-0"
              data-test="action-radio-group"
              @change="resetForm()">
              <div class="d-flex flex-nowrap pl-4">
                <div v-for="(item, $index) in actionItems" :key="$index">
                  <v-radio :value="item.value">
                    <template #label>
                      <div class="font-weight-bold">
                        {{ item.label }}
                      </div>
                    </template>
                  </v-radio>
                  <div v-if="item.description" class="rc-body12 pl-8">
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
            :items="assignableTeams"
            :item-text="(item) => item.name"
            :item-value="(item) => item.id"
            :label="`${$t('task.action.select_team_to_assign')} *`"
            :rules="rules.teamAssignTo"
            data-test="task-action-dialog-team-assign-to" />
        </div>

        <div class="pa-0">
          <v-text-area-with-validation
            v-model="rationale"
            :label="`${$t('task.task_action_dialog.rationale_for_decision')} *`"
            rows="4"
            :rules="rules.rationale" />
        </div>
      </div>
    </rc-dialog>
  </validation-observer>
</template>
<script lang="ts">

import Vue from 'vue';
import { RcDialog, VSelectWithValidation, VTextAreaWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { ITaskEntity, TaskActionTaken, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { ValidationProvider } from 'vee-validate';
import { VForm } from '@libs/shared-lib/types';
import { ITeamEntity } from '@libs/entities-lib/team';
import { TranslateResult } from 'vue-i18n';
import { useTeamStore } from '@/pinia/team/team';
import { useTaskStore } from '@/pinia/task/task';
import helpers from '@/ui/helpers/helpers';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { GlobalHandler } from '@libs/services-lib/http-client';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';

interface IActionItem {
  value: TaskActionTaken;
  label: TranslateResult;
  description: TranslateResult | string;
}

export default Vue.extend({
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

    task: {
      type: Object as () => ITaskEntity,
      required: true,
    },

    selectedTaskCategory: {
      type: String,
      default: '',
    },

    selectedSubCategory: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      rationale: '',
      actionTaken: null as TaskActionTaken,
      assignableTeams: [] as ITeamEntity[],
      assignedTeamId: '',
      submitLoading: false,
      loading: false,
      TaskType,
      helpers,
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
      if (this.task.taskStatus === TaskStatus.Completed) {
        return [
          {
            value: TaskActionTaken.Reopen,
            label: this.$t('task.task_action_dialog.Reopen'),
            description: '',
          },
        ];
      }

      if (this.task.taskType === TaskType.Team) {
        return [
          {
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
          },
        ];
      }
      return [
        {
          value: TaskActionTaken.TaskCompleted,
          label: this.$t('task.task_action_dialog.personal_task.TaskCompleted'),
          description: '',
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
  },

  async created() {
    if (this.task.taskType === TaskType.Team) {
      try {
        this.loading = true;
        await useUserAccountMetadataStore().fetch(this.task.createdBy, GlobalHandler.Partial);
        await this.getAssignableTeams();
      } finally {
        this.loading = false;
      }
    }
  },

  methods: {

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        return;
      }
      this.submitLoading = true;
      try {
        await useTaskStore().taskAction(this.task.id, this.task.caseFileId, { actionType: this.actionTaken, rationale: this.rationale, teamId: this.assignedTeamId });
      } finally {
        this.$emit('update:show', false);
      }
      this.submitLoading = false;
    },

    async getAssignableTeams() {
      const res = await useTeamStore().getTeamsByEvent({ eventId: this.eventId });
      if (res) {
        this.assignableTeams = res.filter((t) => t.isAssignable);
      }
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
.action-select-area{
  background-color: var(--v-grey-lighten4);
  border-radius: 4px;
  width: 100%;
}

.border-bottom {
  border-bottom: 1px solid var(--v-grey-lighten3);
}

.border-radius-6 {
  border-radius: 6px;
}
</style>
