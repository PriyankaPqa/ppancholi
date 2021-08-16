<template>
  <div>
    <mass-action-pre-processed-processed-base
      mass-action-type="massActions.type.importValidationImpactStatus"
      :mass-action-status="MassActionRunStatus.Processed"
      :mass-action="massAction"
      :total="total"
      :successes="successes"
      :failures="failures"
      total-label="massAction.processed.title.1"
      successes-label="massAction.processed.title.2"
      failures-label="massAction.processed.title.3"
      show-download-button />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { IMassActionCombined, MassActionRunStatus } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusPreProcessed',
  components: {
    MassActionPreProcessedProcessedBase,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    successes: {
      type: Number,
      required: true,
    },

    failures: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      MassActionRunStatus,
    };
  },
});
</script>
