<template>
  <div>
    <mass-action-pre-processed-processed-base
      mass-action-type="massActions.type.importValidationImpactStatus"
      :mass-action-status="MassActionRunStatus.PreProcessed"
      :mass-action="massAction"
      :total="total"
      :successes="successes"
      :failures="failures"
      total-label="massAction.pre_processed.title.1"
      successes-label="massAction.pre_processed.title.2"
      failures-label="massAction.pre_processed.title.3"
      show-download-button
      show-process-button
      show-delete-icon
      show-edit-icon
      @download="download()"
      @delete:success="goToHome()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { IMassActionCombined, MassActionRunStatus } from '@/entities/mass-action';
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

  methods: {
    download() {
      return false;
    },

    goToHome() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },
  },
});
</script>
