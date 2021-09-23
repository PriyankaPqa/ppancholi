<template>
  <mass-action-pre-processed-processed-base
    :mass-action-type="MassActionType.ImportValidationOfImpactStatus"
    :mass-action-status="MassActionRunStatus.PreProcessed"
    :mass-action="massAction"
    :total="lastRunMetadata.results.total"
    :successes="lastRunMetadata.results.successes"
    :failures="lastRunMetadata.results.failures"
    total-label="massAction.pre_processed.title.1"
    successes-label="massAction.pre_processed.title.2"
    failures-label="massAction.pre_processed.title.3"
    show-download-button
    show-process-button
    show-delete-icon
    show-edit-icon
    @delete:success="goToHome()" />
</template>

<script lang="ts">
import Vue from 'vue';

import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import {
  IMassActionCombined, IMassActionRunMetadataModel, MassActionRunStatus, MassActionType,
} from '@/entities/mass-action';
import routes from '@/constants/routes';

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

  methods: {
    goToHome() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },
  },
});
</script>
