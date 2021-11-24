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
      :items="formattedHistory">
      <template #[`item.username`]="{ item }">
        <b>{{ item.username }}</b>
        <span v-if="item.roleName" class="pl-2">({{ item.roleName }})</span>
      </template>
      <template #[`item.date`]="{ item }">
        {{ item.formattedDate }}
      </template>
    </v-data-table>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@crctech/component-library';
import { IVersionedEntityCombined } from '@crctech/registration-lib/src/entities/value-objects/versioned-entity';
import { DataTableHeader } from 'vuetify';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { ApprovalAction, IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';

interface IApprovalHistory {
  username: string,
  roleName?: string,
  rationale: string,
  date: Date,
  formattedDate: string,
  action: string,
}

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
    };
  },

  computed: {
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

    /// note that this method covers the requirements for release 1 - it WILL NOT reflect new approval stories without rework
    formattedHistory(): IApprovalHistory[] {
      if (!this.submittedHistory) {
        return [];
      }
      // totally static data - this feature will EVENTUALLY be rewritten...
      return [{
        username: this.submittedHistory.userName,
        roleName: this.$m(this.submittedHistory.roleName),
        rationale: 'Payment created',
        date: new Date(this.submittedHistory.timestamp),
        formattedDate: helpers.getLocalStringDate(this.submittedHistory.timestamp, 'Entity.timestamp', 'll'),
        action: 'Submitted',
      }, {
        username: 'System',
        rationale: 'Assistance approved on assessment form or assistance did not require approval',
        formattedDate: helpers.getLocalStringDate(this.submittedHistory.timestamp, 'Entity.timestamp', 'll'),
        date: new Date(this.submittedHistory.timestamp),
        action: 'Approved - Final',
      }];
    },
  },

  async created() {
    this.historyItems = await this.$storage.financialAssistancePayment.actions.fetchHistory(this.financialAssistance.id, false);
    /// we find the one history line we want... and massactions doesnt create a submitted last action...
    this.submittedHistory = this.historyItems.find((h) => h.entity.lastAction === 'Submit')
      || this.historyItems.find((h) => h.entity.lastAction === 'Created'
        && (h.entity as IFinancialAssistancePaymentEntity).approvalAction === ApprovalAction.Submitted);
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },
  },
});

</script>
