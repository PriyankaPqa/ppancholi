<template>
  <mass-action-processing-base :number-item="numberItem" :mass-action="massAction" :process-title="processTitle" />
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import { IMassActionCombined } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusPreProcessing',
  components: {
    MassActionProcessingBase,
  },
  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    numberItem: {
      type: Number,
      default: 0,
    },

    processTitle: {
      type: String,
      default: 'massActions.processing.files',
    },
  },
});
</script>
