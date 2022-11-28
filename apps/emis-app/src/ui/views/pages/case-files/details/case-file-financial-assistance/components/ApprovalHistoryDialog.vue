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
      :items="approvalHistoryItems">
      <template #[`item.username`]="{ item }">
        <b class="no-word-break">{{ item.submittedBy.userName }}</b>
        <span v-if="item.submittedBy.roleName" class="pl-2 no-word-break">({{ $m(item.submittedBy.roleName) }})</span>
      </template>
      <template #[`item.rationale`]="{ item }">
        {{ getRationaleText(item) }}
      </template>
      <template #[`item.date`]="{ item }">
        <div class="text-no-wrap">
          {{ getLocalStringDate(item.dateOfApprovalAction, 'Entity.timestamp', 'll') }}
        </div>
      </template>
      <template #[`item.action`]="{ item }">
        <div class="no-word-break">
          {{ $t(`enums.approvalAction.${ApprovalAction[item.approvalAction]}`) }}
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
import {
 ApprovalAction, IFinancialAssistancePaymentEntity, IApprovalStatusHistory,
} from '@libs/entities-lib/financial-assistance-payment';

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
      return this.financialAssistance.approvalStatusHistory || [];
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.username') as string,
          filterable: false,
          value: 'username',
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.rationale') as string,
          filterable: false,
          value: 'rationale',
          width: '50%',
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.date') as string,
          filterable: false,
          value: 'date',
        },
        {
          text: this.$t('caseFile.financialAssistance.approvalHistory.action') as string,
          filterable: false,
          value: 'action',
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
  },
});

</script>

<style lang="scss" scoped>
  .no-word-break{
    word-break: initial;
  }
</style>
