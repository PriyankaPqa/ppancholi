<template>
  <rc-dialog
    :title="$t('caseFile.financialAssistance.approvalHistory')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    max-width="1250"
    min-height="500"
    :fullscreen="$vuetify.breakpoint.mdAndDown"
    persistent
    :show-submit="false"
    @close="close"
    @cancel="close">
    <div class="pb-4 d-flex justify-space-between">
      <h3 data-test="fa-name">
        {{ financialAssistance.name }}
      </h3>
      <div>
        <status-chip status-name="ApprovalStatus" :status="financialAssistance.approvalStatus" />
      </div>
    </div>
    <v-data-table
      data-test="history-table"
      class="flex-grow-1 scrollable"
      :headers="headers"
      hide-default-footer
      must-sort
      multi-line
      :items="approvalHistoryItems"
      :items-per-page="-1">
      <template #[`item.submittedBy.userName`]="{ item }">
        <div class="text-no-wrap" :data-test="`crc-personnel-item`">
          <b class="no-word-break">{{ item.submittedBy.userName }}</b>
          <span v-if="item.submittedBy.roleName" class="pl-2 no-word-break">({{ $m(item.submittedBy.roleName) }})</span>
        </div>
      </template>
      <template #[`item.rationale`]="{ item }">
        <span :data-test="`rationale-item`">
          {{ getRationaleText(item) }}
        </span>
      </template>
      <template #[`item.dateOfApprovalAction`]="{ item }">
        <div class="text-no-wrap" :data-test="`date-item`">
          {{ getLocalStringDate(item.dateOfApprovalAction, 'Entity.timestamp', 'PP') }}
        </div>
      </template>
      <template #[`item.actionText`]="{ item }">
        <div class="no-word-break" :data-test="`action-item`">
          {{ item.actionText }}
        </div>
        <div
          v-if="displayUserSubmittedTo(item.approvalAction) && item.submittedTo && item.submittedTo.userName">
          {{ `${item.submittedTo.userName} (${$m(item.submittedTo.roleName)})` }}
        </div>
      </template>
    </v-data-table>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { system } from '@/constants/system';
import { RcDialog } from '@libs/component-lib/components';
import { IVersionedEntityCombined } from '@libs/entities-lib/src/value-objects/versioned-entity';
import { DataTableHeader } from 'vuetify';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { ApprovalAction, IApprovalStatusHistory, IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';

export default Vue.extend({
  name: 'ApprovalHistoryDialog',

  components: {
    RcDialog,
    StatusChip,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    financialAssistance: {
      type: Object as () => IFinancialAssistancePaymentEntity,
      required: true,
    },
  },

  data() {
    return {
      historyItems: [] as IVersionedEntityCombined[],
      submittedHistory: null as IVersionedEntityCombined,
      getLocalStringDate: helpers.getLocalStringDate,
      ApprovalAction,
    };
  },

  computed: {
    approvalHistoryItems(): IApprovalStatusHistory[] {
      const approvalHistoryItemsWithText: IApprovalStatusHistory[] = [];
      this.financialAssistance.approvalStatusHistory.forEach((e) => {
        let approvalHistoryItemsWithTextItem;
          switch (e.approvalAction) {
            case ApprovalAction.Submitted:
              approvalHistoryItemsWithTextItem = e.submittedTo?.userName ? {
                ...e,
                actionText: `${this.$t('caseFile.financialAssistance.approvalHistory.action.submittedTo')}` as string,
              } : {
                ...e,
                actionText: `${this.$t('enums.approvalAction.Submitted')}` as string,
              };
              break;

            case ApprovalAction.Approved:
              approvalHistoryItemsWithTextItem = {
                ...e,
                actionText: `${this.$t('caseFile.financialAssistance.approvalHistory.action.approvedAndSubmittedTo')}` as string,
              };
              break;

            default: approvalHistoryItemsWithTextItem = {
              ...e,
              actionText: this.$t(`enums.approvalAction.${ApprovalAction[e.approvalAction]}`) as string,
            };
          }
        approvalHistoryItemsWithText.push(approvalHistoryItemsWithTextItem);
      });

      return approvalHistoryItemsWithText || [];
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.username') as string,
          filterable: false,
          value: 'submittedBy.userName',
          sortable: true,
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.rationale') as string,
          filterable: false,
          value: 'rationale',
          width: '50%',
          sortable: false,
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.date') as string,
          filterable: false,
          value: 'dateOfApprovalAction',
          sortable: true,
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.action') as string,
          filterable: false,
          value: 'actionText',
          sortable: true,
        },
      ];
    },
  },

  methods: {
    getRationaleText(item: IApprovalStatusHistory): string {
      if (!item.rationale) {
        if (item.submittedBy.userId === system.system_user_id && item.approvalAction === ApprovalAction.ApprovedFinal) {
          return this.$t('caseFile.financialAssistance.approvalHistory.rationale.approved') as string;
        }
        if (item.approvalAction === ApprovalAction.Submitted && item.submittedTo?.userId) {
          return this.$t('caseFile.financialAssistance.approvalHistory.rationale.submittedTo', { user: item.submittedTo?.userName }) as string;
        }
        return '-';
      }
      return item.rationale;
    },

    close() {
      this.$emit('update:show', false);
    },

    displayUserSubmittedTo(approvalAction: ApprovalAction): boolean {
      return (approvalAction === ApprovalAction.Submitted || approvalAction === ApprovalAction.Approved);
    },
  },
});

</script>

<style lang="scss" scoped>
  .no-word-break{
    word-break: initial;
  }
</style>
