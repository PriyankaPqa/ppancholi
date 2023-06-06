import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import _isEmpty from 'lodash/isEmpty';
import {
  IMassActionEntity, IMassActionMetadata, IMassActionRun, IMassActionRunMetadataModel, IMassActionRunResultMetadataModel, MassActionRunStatus,
} from '@libs/entities-lib/mass-action';
import { useMassActionMetadataStore, useMassActionStore } from '@/pinia/mass-action/mass-action';

export default Vue.extend({
  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },

    massAction(): IMassActionEntity {
      return useMassActionStore().getById(this.massActionId);
    },

    massActionMetadata(): IMassActionMetadata {
      return useMassActionMetadataStore().getById(this.massActionId);
    },

    lastRunEntity(): IMassActionRun {
      return _orderBy(this.massAction?.runs, 'timestamp', 'desc')[0];
    },

    lastRunMetadata(): IMassActionRunMetadataModel {
      if (this.massActionMetadata) {
        return this.massActionMetadata?.lastRun;
      }
      return null;
    },

    lastRunResults(): IMassActionRunResultMetadataModel {
      return this.lastRunMetadata?.results || {} as IMassActionRunResultMetadataModel;
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

  async created() {
    if (_isEmpty(this.massAction)) {
      await useMassActionStore().fetch(this.massActionId);
      await useMassActionMetadataStore().fetch(this.massActionId, false);
    }
  },
});
