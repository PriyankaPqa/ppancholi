<template>
  <rc-dialog
    :title="$t('caseFile.financialAssistance.paymentStatusHistory')"
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
      <div data-test="payment-modality" class="rc-h3">
        {{
          $t(`enums.PaymentModality.${EPaymentModalities[paymentGroup.groupingInformation.modality]}`)
        }}
      </div>
      <div>
        <status-chip status-name="FinancialAssistancePaymentStatus" :status="paymentGroup.paymentStatus" />
      </div>
    </div>
    <v-data-table-a11y
      data-test="history-table"
      class="flex-grow-1 scrollable"
      :headers="headers"
      hide-default-footer
      must-sort
      :items="paymentStatusHistory"
      :items-per-page="-1">
      <template #[`item.userInformation.userName`]="{ item }">
        <b class="no-word-break">{{ item.userInformation.userName }}</b>
        <span v-if="item.userInformation.roleName" class="pl-2 no-word-break">({{ $m(item.userInformation.roleName) }})</span>
      </template>
      <template #[`item.dateOfAction`]="{ item }">
        {{ format(new Date(item.dateOfAction), 'PP') }}
      </template>
      <template #[`item.actualDateOfAction`]="{ item }">
        <div class="text-no-wrap">
          {{ item.actualDateOfAction ? format(new Date(item.actualDateOfAction), 'PP') : '-' }}
        </div>
      </template>
      <template #[`item.paymentStatusText`]="{ item }">
        <div class="no-word-break">
          {{ item.paymentStatusText }}
        </div>
      </template>
    </v-data-table-a11y>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { IVersionedEntityCombined } from '@libs/entities-lib/src/value-objects/versioned-entity';
import { DataTableHeader } from 'vuetify';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { EPaymentModalities } from '@libs/entities-lib/program/program.types';
import {
  IFinancialAssistancePaymentGroup, IPaymentStatusHistory, PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { format } from 'date-fns';

export default Vue.extend({
  name: 'PaymentStatusHistoryDialog',

  components: {
    RcDialog,
    StatusChip,
    VDataTableA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    paymentGroup: {
      type: Object as () => IFinancialAssistancePaymentGroup,
      required: true,
    },
  },

  data() {
    return {
      historyItems: [] as IVersionedEntityCombined[],
      submittedHistory: null as IVersionedEntityCombined,
      getLocalStringDate: helpers.getLocalStringDate,
      PaymentStatus,
      EPaymentModalities,
      format,
    };
  },

  computed: {
    paymentStatusHistory(): IPaymentStatusHistory[] {
      const paymentStatusHistoryWithText: IPaymentStatusHistory[] = [];
      this.paymentGroup.paymentStatusHistory.forEach((e) => {
        const paymentStatusHistoryItem = {
          ...e,
          paymentStatusText: this.$t(`enums.paymentStatus.${PaymentStatus[e.paymentStatus]}`) as string,
        };
        paymentStatusHistoryWithText.push(paymentStatusHistoryItem);
      });
      return paymentStatusHistoryWithText;
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFile.financialAssistance.paymentStatusHistory.systemUser') as string,
          filterable: false,
          value: 'userInformation.userName',
          width: '40%',
          sortable: true,
        },
        {
          text: this.$t('caseFile.financialAssistance.paymentStatusHistory.systemDateOfAction') as string,
          filterable: false,
          value: 'dateOfAction',
          sortable: true,
        },
        {
          text: this.$t('caseFile.financialAssistance.paymentStatusHistory.actualDate') as string,
          filterable: false,
          value: 'actualDateOfAction',
          sortable: true,
        },
        {
          text: this.$t('caseFile.financialAssistance.paymentStatusHistory.previousStatus') as string,
          filterable: false,
          value: 'paymentStatusText',
          sortable: true,
        },
      ];
    },
  },

  methods: {
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
