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
      @process="onProcess()"
      @update="update($event)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { IMassActionCombined, MassActionRunStatus, MassActionRunType } from '@/entities/mass-action';

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

    async startProcess(id: string, runType: MassActionRunType) {
      await this.$storage.massAction.actions.process(id, runType);
    },

    async onProcess() {
      const userChoice = await this.$confirm(this.$t('massAction.confirm.processing.title'), this.$t('massAction.confirm.processing.message'));
      if (userChoice) {
        await this.startProcess(this.massAction.entity.id, MassActionRunType.Process);
      }
    },

    download() {
      return false;
    },

    async update(payload: {name: string; description: string}) {
      const res = await this.$storage.massAction.actions.update(this.massAction.entity.id, payload);
      if (res) {
        this.$toasted.global.success(this.$t('massAction.update.success'));
      }
    },
  },
});
</script>
