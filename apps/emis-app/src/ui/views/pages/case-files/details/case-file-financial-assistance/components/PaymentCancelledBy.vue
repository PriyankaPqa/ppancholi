<template>
  <div class="cancellationReason rc-body12">
    <v-icon small color="red" class="mr-4">
      mdi-alert
    </v-icon>
    <div class="mr-4" data-test="financialPayment_cancellation_by_text">
      {{ cancellationByText }}
    </div>
    <div v-if="reason !== null && cancellationReasonText" data-test="financialPayment_cancellation_reason">
      {{ cancellationReasonText }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import helpers from '@/ui/helpers/helpers';
import { system } from '@/constants/system';
import { EPaymentCancellationReason } from '@libs/entities-lib/financial-assistance-payment';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'PaymentCancelledBy',

  props: {
    isLineLevel: {
      type: Boolean,
      default: false,
    },

    by: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    reason: {
      type: Number as () => EPaymentCancellationReason,
      default: null,
    },

  },

  data() {
    return {
      cancellationReasons: helpers.enumToTranslatedCollection(EPaymentCancellationReason, 'enums.paymentCancellationReason'),
    };
  },

  computed: {
    cancellationByText(): TranslateResult {
      return this.$t(
        this.isLineLevel ? 'caseFile.financialAssistance.cancellationReason.lineByOn' : 'caseFile.financialAssistance.cancellationReason.byOn',
        {
          by: this.by === system.system_user_id ? this.$t('system.system_user_id') : useUserAccountMetadataStore().getById(this.by)?.displayName || '',
          on: helpers.getLocalStringDate(this.date, 'IFinancialAssistancePaymentGroup.cancellationDate', 'PP'),
        },
      );
    },

    cancellationReasonText(): string {
      const text = this.cancellationReasons.filter((a) => a.value === this.reason)[0]?.text;
      return text ? `${this.$t('caseFile.financialAssistance.cancellationReason.reason')} ${text}` : null;
    },
  },
});
</script>

<style scoped lang="scss">

.cancellationReason {
  padding: 4px 16px;
  background: var(--v-status_red_pale-base);
  display: flex;
}

</style>
