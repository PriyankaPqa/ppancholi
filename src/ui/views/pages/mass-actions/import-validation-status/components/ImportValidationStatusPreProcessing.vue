<template>
  <mass-action-pre-processing-base :mass-action="massAction" mass-action-type="massActions.type.importValidationImpactStatus" />
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionPreProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessingBase.vue';
import { IMassActionCombined } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusPreProcessing',
  components: {
    MassActionPreProcessingBase,
  },
  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },
  },
});
</script>
