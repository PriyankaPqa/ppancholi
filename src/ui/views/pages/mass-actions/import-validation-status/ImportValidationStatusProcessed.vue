<template>
  <mass-action-pre-processed-processed-base
    :mass-action-type="MassActionType.ImportValidationOfImpactStatus"
    :mass-action-status="MassActionRunStatus.Processed"
    :mass-action="massAction"
    :total="lastRunMetadata.results.total"
    :successes="lastRunMetadata.results.successes"
    :failures="lastRunMetadata.results.failures"
    total-label="massAction.processed.title.1"
    successes-label="massAction.processed.title.2"
    failures-label="massAction.processed.title.3"
    show-download-button />
</template>

<script lang="ts">
import Vue from 'vue';

import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import {
  IMassActionCombined, IMassActionRunMetadataModel, MassActionRunStatus, MassActionType,
} from '@/entities/mass-action';

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
