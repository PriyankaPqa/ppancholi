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
      <div class="px-16">
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

        <div v-if="showAssignTeamSelect" class=" py-0">
          <v-select-with-validation
            v-model="assignedTeamId"
            :items="teamsOfEvent"
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
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { IdParams, ITeamEntity, ITeamMetadata } from '@libs/entities-lib/team';
import { useTeamMetadataStore, useTeamStore } from '@/pinia/team/team';
import { TranslateResult } from 'vue-i18n';
import { useTaskStore } from '@/pinia/task/task';

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
      default: '',
    },

    task: {
      type: Object as () => ITaskEntity,
      required: true,
    },
  },

  data() {
    return {
      rationale: '',
      actionTaken: null as TaskActionTaken,
      combinedTeamStore: new CombinedStoreFactory<ITeamEntity, ITeamMetadata, IdParams>(useTeamStore(), useTeamMetadataStore()),
      teamsOfEvent: [] as ITeamEntity[],
      assignedTeamId: '',
      submitLoading: false,
      loading: false,
      TaskType,
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
  },

  async created() {
    if (this.task.taskType === TaskType.Team) {
      try {
        this.loading = true;
        await this.fetchTeamsOfEvent();
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

    async fetchTeamsOfEvent() {
      const res = await this.$services.teams.getTeamsByEvent(this.eventId);
      if (res) {
        this.teamsOfEvent = res.filter((t) => t.isAssignable);
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
</style>
