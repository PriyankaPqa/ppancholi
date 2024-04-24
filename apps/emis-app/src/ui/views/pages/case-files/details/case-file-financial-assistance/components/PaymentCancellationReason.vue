<template>
  <rc-confirmation-dialog
    data-test="cancel_confirmation_reason_dialog"
    :show="true"
    min-height="400"
    :title="$t('caseFile.financialAssistance.changeStatusDialog.title')"
    :submit-button-disabled="cancellationReason == null"
    submit-button-key="caseFile.financialAssistance.cancelPaymentDialog.button"
    @submit="onSelectReason"
    @cancel="$emit('close')"
    @close="$emit('close')">
    <template #default>
      <div>
        <div
          class=" d-flex pb-5 warning-text"
          data-test="paymentGroup__cancellationWarning">
          <v-icon size="20" color="red" class="pr-1">
            mdi-alert-outline
          </v-icon>
          {{ $t(isLineLevel ? 'caseFile.financialAssistance.cancelPaymentGroup.confirm.message.cancellationReason'
            : 'caseFile.financialAssistance.cancelPaymentGroup.confirm.message.cancellationReason.lines') }}
        </div>
        <div class="rc-body16 fw-bold mb-4">
          {{ $t('caseFile.financialAssistance.cancelPaymentDialog.message') }}
        </div>
        <v-select-with-validation
          v-model="cancellationReason"
          data-test="paymentGroup__cancellationReason"
          :items="cancellationReasons"
          rules="required"
          :label="`${$t('caseFile.financialAssistance.cancelPaymentDialog.chooseReason')} *`" />
      </div>
    </template>
  </rc-confirmation-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcConfirmationDialog, VSelectWithValidation } from '@libs/component-lib/components';
import {
  EPaymentCancellationReason,
} from '@libs/entities-lib/financial-assistance-payment';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'PaymentCancellationReason',

  components: {
    RcConfirmationDialog,
    VSelectWithValidation,
  },

  props: {
    isLineLevel: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      cancellationReason: null as EPaymentCancellationReason,
      cancellationReasons: helpers.enumToTranslatedCollection(EPaymentCancellationReason, 'enums.paymentCancellationReason'),
    };
  },

  methods: {
    onSelectReason() {
      this.$emit('cancel-with-reason', this.cancellationReason);
    },
  },
});
</script>

<style scoped lang="scss">
  .warning-text {
    color: red
  }

</style>
