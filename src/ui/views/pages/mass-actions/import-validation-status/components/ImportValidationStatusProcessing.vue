<template>
  <mass-action-processing-base
    :mass-action-status="MassActionRunStatus.Processing"
    :mass-action="massAction"
    :process-title="processTitle" />
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import { IMassActionCombined, MassActionRunStatus } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusProcessing',
  components: {
    MassActionProcessingBase,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    processTitle: {
      type: String,
      default: 'massActions.processing.files',
    },
  },

  data() {
    return {
      MassActionRunStatus,
    };
  },

});
</script>
