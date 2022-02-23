import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import _isEmpty from 'lodash/isEmpty';
import {
  IMassActionCombined, IMassActionRun, IMassActionRunMetadataModel, MassActionRunStatus,
} from '@/entities/mass-action';

export default Vue.extend({
  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },

    massAction(): IMassActionCombined {
      return this.$storage.massAction.getters.get(this.massActionId);
    },

    lastRunEntity(): IMassActionRun {
      return _orderBy(this.massAction.entity.runs, 'timestamp', 'desc')[0];
    },

    lastRunMetadata(): IMassActionRunMetadataModel {
      if (this.massAction.metadata) {
        return this.massAction.metadata.lastRun;
      }
      return null;
    },

    preProcessing(): boolean {
      return this.lastRunEntity?.runStatus === MassActionRunStatus.PreProcessing;
    },

    processing(): boolean {
      return this.lastRunEntity?.runStatus === MassActionRunStatus.Processing;
    },

    preProcessed(): boolean {
      return this.lastRunEntity?.runStatus === MassActionRunStatus.PreProcessed;
    },

    processed(): boolean {
      return this.lastRunEntity?.runStatus === MassActionRunStatus.Processed;
    },
  },

  created() {
    if (_isEmpty(this.massAction.entity)) {
      this.$storage.massAction.actions.fetch(this.massActionId);
    }
  },
});
