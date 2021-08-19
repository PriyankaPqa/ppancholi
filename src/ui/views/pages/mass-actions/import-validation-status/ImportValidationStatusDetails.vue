<template>
  <rc-page-content :title="title">
    <import-validation-status-pre-processing v-if="preProcessing" :mass-action="massAction" />

    <import-validation-status-processing v-else-if="processing && lastRunMetadata" :mass-action="massAction" />

    <import-validation-status-pre-processed
      v-else-if="lastRunMetadata && preProcessed"
      :mass-action="massAction"
      :total="lastRunMetadata.results.total"
      :successes="lastRunMetadata.results.successes"
      :failures="lastRunMetadata.results.failures" />

    <import-validation-status-processed
      v-else-if="lastRunMetadata && processed"
      :mass-action="massAction"
      :total="lastRunMetadata.results.total"
      :successes="lastRunMetadata.results.successes"
      :failures="lastRunMetadata.results.failures" />

    <template v-else>
      This mass action status page is not yet implemented
    </template>

    <template slot="actions">
      <v-btn color="primary" @click="back()">
        {{ $t('massActions.backToList.label') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import _isEmpty from 'lodash/isEmpty';
import _orderBy from 'lodash/orderBy';
import routes from '@/constants/routes';
import {
  IMassActionCombined, IMassActionRun, IMassActionRunMetadataModel, MassActionRunStatus,
} from '@/entities/mass-action';
import ImportValidationStatusProcessing from './ImportValidationStatusProcessing.vue';
import ImportValidationStatusPreProcessing from './ImportValidationStatusPreProcessing.vue';
import ImportValidationStatusPreProcessed from '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusPreProcessed.vue';
import ImportValidationStatusProcessed from '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusProcessed.vue';

export default Vue.extend({
  name: 'ImportValidationStatusDetails',

  components: {
    ImportValidationStatusPreProcessed,
    RcPageContent,
    ImportValidationStatusPreProcessing,
    ImportValidationStatusProcessing,
    ImportValidationStatusProcessed,
  },

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

    title(): TranslateResult {
      if (this.preProcessing) return this.$t('massActions.impactValidation.status.preprocessing.title');
      if (this.processing) return this.$t('massActions.impactValidation.status.processing.title');
      return this.$t('massActions.impactValidation.status.details.title');
    },
  },

  created() {
    if (_isEmpty(this.massAction.entity)) {
      this.$storage.massAction.actions.fetch(this.massActionId);
    }
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },
  },
});
</script>
