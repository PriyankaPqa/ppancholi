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
      <template #[`item.${customColumns.dateOfChange}`]="{ item }">
        {{ helpers.getLocalStringDate(item.timestamp, '', 'PP') }}
      </template>
      <template #[`item.${customColumns.actionTaken}`]="{ item }">
        <div class="no-word-break">
          {{ item.actionTakenString }}
        </div>
      </template>
      <template #[`item.${customColumns.rationale}`]="{ item }">
        <div class="no-word-break">
          {{ item.rationale || $t('common.N/A') }}
        </div>
      </template>
    </v-data-table-a11y>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { ActionTaken, ITaskActionHistory, TaskStatus } from '@libs/entities-lib/task';
import helpers from '@/ui/helpers/helpers';
import { TranslateResult } from 'vue-i18n';

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
  },

  data() {
    return {
      parsedTaskActionHistoryData: [] as Array<IParsedTaskHistory>,
      loading: false,
      helpers,
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
          text: this.$t('task.history.header.date_of_change') as string,
          filterable: false,
          value: 'timestamp',
          width: '15%',
          sortable: true,
        },
        {
          text: this.$t('task.history.header.action_taken') as string,
          filterable: false,
          value: 'actionTaken',
          width: '20%',
          sortable: true,
        },
        {
          text: this.$t('task.history.header.rationale') as string,
          filterable: false,
          value: 'rationale',
          width: '45%',
          sortable: false,
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
    created() {
      this.parseTaskHistory();
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    generateTaskActionString(historyItem: ITaskActionHistory, assignedTeamName = '', actionTeamName = ''): TranslateResult | string {
      if (historyItem.actionTaken) {
        const actionType: { [index: number ]: TranslateResult } = {
          [ActionTaken.Create]: this.$t('task.history.action_taken.created'),
          [ActionTaken.Assign]: this.$t('task.history.action_taken.assigned', { x: assignedTeamName }),
          [ActionTaken.Completed]: (historyItem.taskStatus === TaskStatus.InProgress
            ? this.$t('task.history.action_taken.action_completed', { x: assignedTeamName, y: actionTeamName })
            : this.$t('task.history.action_taken.completed')),
          [ActionTaken.Reopen]: this.$t('task.history.action_taken.reopen'),
        };
        return actionType[historyItem.actionTaken];
      }
      if (historyItem.taskStatus === TaskStatus.Completed) {
        return this.$t('task.history.action_taken.completed');
      }
      return '';
    },

    parseTaskHistory() {
      this.parsedTaskActionHistoryData = this.taskActionHistories.reverse().map((historyItem: ITaskActionHistory) => {
        const actionTakenString = this.generateTaskActionString(historyItem, historyItem.currentTeamName, historyItem.previousTeamName);
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
