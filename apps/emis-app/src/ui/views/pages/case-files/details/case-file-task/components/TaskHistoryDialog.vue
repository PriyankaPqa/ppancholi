<template>
  <rc-dialog
    :title="$t('task.history.title')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-only-scrolling
    content-padding="0"
    fullscreen
    persistent
    :loading="loading"
    :show-submit="false"
    @close="close"
    @cancel="close">
    <v-data-table-a11y
      data-test="history-table"
      class="flex-grow-1 scrollable"
      :headers="headers"
      hide-default-footer
      must-sort
      :custom-columns="Object.values(customColumns)"
      :count="parsedTaskActionHistoryData.length"
      :items="parsedTaskActionHistoryData"
      :items-per-page="-1">
      <template #[`item.${customColumns.userInformation}`]="{ item }">
        <div class="py-2">
          <b class="no-word-break">{{ item.userInformation.userName }}</b>
          <div class="no-word-break">
            ({{ $m(item.userInformation.roleName) }})
          </div>
        </div>
      </template>

      <template #[`item.${customColumns.actionTaken}`]="{ item }">
        <div class="no-word-break">
          {{ item.actionTakenString }}
        </div>
      </template>
      <template #[`item.${customColumns.rationale}`]="{ item }">
        <div class="no-word-break">
          {{ item.rationale || '-' }}
        </div>
      </template>
      <template #[`item.${customColumns.dateOfChange}`]="{ item }">
        {{ helpers.getLocalStringDate(item.timestamp, '', 'PP') }}
      </template>
    </v-data-table-a11y>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { HistoryActionTaken, ITaskActionHistory, TaskStatus } from '@libs/entities-lib/task';
import helpers from '@/ui/helpers/helpers';
import { TranslateResult } from 'vue-i18n';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { UserRolesNames } from '@libs/entities-lib/user';
import { useUserAccountStore } from '@/pinia/user-account/user-account';

interface IParsedTaskHistory extends ITaskActionHistory {
  actionTakenString: TranslateResult;
}

export default Vue.extend({
  name: 'TaskHistoryDialog',

  components: {
    RcDialog,
    VDataTableA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    taskActionHistories: {
      type: Array as () => ITaskActionHistory[],
      required: true,
    },

    isPersonalTask: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      parsedTaskActionHistoryData: [] as Array<IParsedTaskHistory>,
      loading: false,
      helpers,
      roles: [] as IOptionItem[],
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('task.history.header.edited_by') as string,
          filterable: false,
          value: 'userInformation.userName',
          width: '20%',
          sortable: true,
        },
        {
          text: this.$t('task.history.header.action_taken') as string,
          filterable: false,
          value: 'actionTaken',
          width: '30%',
          sortable: true,
        },
        {
          text: this.$t('task.history.header.rationale') as string,
          filterable: false,
          value: 'rationale',
          width: '35%',
          sortable: false,
        },
        {
          text: this.$t('task.history.header.date_of_change') as string,
          filterable: false,
          value: 'timestamp',
          width: '15%',
          sortable: true,
        },
      ];
    },

    customColumns(): Record<string, string> {
      return {
        userInformation: 'userInformation.userName',
        dateOfChange: 'timestamp',
        actionTaken: 'actionTaken',
        rationale: 'rationale',
      };
    },
  },
    async created() {
      await useUserAccountStore().fetchRoles();
      this.parseTaskHistory();
    },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    generateTaskActionString(historyItem: ITaskActionHistory): TranslateResult | string {
      const assignedTeamName = historyItem.currentTeamName;
      const actionTeamName = historyItem.previousTeamName;
      const updatedByTeamName = historyItem.userInformation.teamName;
      const userName = historyItem.userInformation.userName;
      const L6RoleIds = useUserAccountStore().rolesByLevels([UserRolesNames.level6])?.map((r) => r.id);
      const userIsL6 = L6RoleIds && L6RoleIds.includes(historyItem.userInformation.roleId);
      const workingOnItHistoryString = () => {
        if (userIsL6) {
          return (historyItem.currentUserWorkingOn
            ? this.$t('task.history.action_taken.working_on_it_l6', { x: userName })
            : this.$t('task.history.action_taken.no_longer_working_on_it_l6', { x: userName }));
        }
        return (historyItem.currentUserWorkingOn
          ? this.$t('task.history.action_taken.working_on_it', { x: userName, y: assignedTeamName })
          : this.$t('task.history.action_taken.no_longer_working_on_it', { x: userName, y: assignedTeamName }));
      };
      const taskCompleteHistoryString = () => (
        userIsL6
          ? this.$t('task.history.action_taken.completed_l6', { x: userName })
          : this.$t('task.history.action_taken.completed', { x: userName, y: assignedTeamName })
      );

      if (this.isPersonalTask && historyItem.actionTaken) {
        const personalActionType: { [index: number ]: TranslateResult } = {
          [HistoryActionTaken.Completed]: this.$t('task.history.action_taken.personal_task_completed'),
          [HistoryActionTaken.Cancelled]: this.$t('task.history.action_taken.personal_task_cancelled'),
        };
        return personalActionType[historyItem.actionTaken];
      }

      if (historyItem.actionTaken) {
        const actionType: { [index: number ]: TranslateResult } = {
          [HistoryActionTaken.Create]: this.$t('task.history.action_taken.created'),
          [HistoryActionTaken.Assign]: this.$t('task.history.action_taken.assigned', { x: assignedTeamName, y: actionTeamName }),
          [HistoryActionTaken.Completed]: (historyItem.taskStatus === TaskStatus.InProgress
            ? this.$t('task.history.action_taken.action_completed', { x: assignedTeamName, y: actionTeamName })
            : taskCompleteHistoryString()),
          [HistoryActionTaken.Reopen]: this.$t('task.history.action_taken.reopen', { x: assignedTeamName }),
          [HistoryActionTaken.Cancelled]: userIsL6
            ? this.$t('task.history.action_taken.cancelled_l6', { x: userName })
            : this.$t('task.history.action_taken.cancelled', { x: userName, y: updatedByTeamName }),
          [HistoryActionTaken.WorkingOn]: workingOnItHistoryString(),
          [HistoryActionTaken.UrgentStatusTagUpdated]: userIsL6
            ? this.$t('task.history.action_taken.urgent_value_update_l6', { x: userName })
            : this.$t('task.history.action_taken.urgent_value_update', { x: userName, y: updatedByTeamName }),
          [HistoryActionTaken.FinancialAssistancePaymentUpdated]: userIsL6
            ? this.$t('task.history.action_taken.fa_payment_update_l6', { x: userName, z: historyItem.financialAssistancePaymentName ?? '-' })
            : this.$t('task.history.action_taken.fa_payment_update', { x: userName, y: updatedByTeamName, z: historyItem.financialAssistancePaymentName ?? '-' }),
          [HistoryActionTaken.TaskDetailsUpdated]: userIsL6
            ? this.$t('task.history.action_taken.task_details_update_l6', { x: userName })
            : this.$t('task.history.action_taken.task_details_update', { x: userName, y: updatedByTeamName }),
        };
        return actionType[historyItem.actionTaken];
      }
      return '';
    },

    parseTaskHistory() {
      this.parsedTaskActionHistoryData = this.taskActionHistories.map((historyItem: ITaskActionHistory) => {
        const actionTakenString = this.generateTaskActionString(historyItem);
        return {
          ...historyItem,
          actionTakenString,
        };
      });
    },
  },
});

</script>

<style lang="scss" scoped>
.no-word-break{
  word-break: initial;
}
</style>
