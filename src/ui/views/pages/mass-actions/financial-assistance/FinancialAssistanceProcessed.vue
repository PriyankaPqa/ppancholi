<template>
  <div>
    <mass-action-pre-processed-processed-base
      :mass-action-type="MassActionType.FinancialAssistance"
      :mass-action-status="MassActionRunStatus.Processed"
      :mass-action="massAction"
      :total="lastRunMetadata.results.total"
      :successes="lastRunMetadata.results.successes"
      :failures="lastRunMetadata.results.failures"
      :projected-amount="lastRunMetadata.projectedAmount"
      :successes-amount="lastRunMetadata.totalAmount"
      total-label="massAction.pre_processed.title.1"
      successes-label="massAction.pre_processed.title.2"
      failures-label="massAction.pre_processed.title.3"
      show-download-button>
      <template #payment-details>
        <financial-assistance-payment-details-table :mass-action="massAction" />
      </template>
    </mass-action-pre-processed-processed-base>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import {
  IMassActionCombined, IMassActionRunMetadataModel, MassActionRunStatus, MassActionType,
} from '@/entities/mass-action';
import FinancialAssistancePaymentDetailsTable from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetailsTable.vue';

export default Vue.extend({
  name: 'FinancialAssistanceProcessed',
  components: {
    FinancialAssistancePaymentDetailsTable,
    MassActionPreProcessedProcessedBase,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    lastRunMetadata: {
      type: Object as () => IMassActionRunMetadataModel,
      required: true,
    },
  },

  data() {
    return {
      MassActionRunStatus,
      MassActionType,
    };
  },
});
</script>
