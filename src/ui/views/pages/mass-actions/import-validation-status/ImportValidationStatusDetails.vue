<template>
  <rc-page-content :title="title">
    <import-validation-status-pre-processing v-if="preProcessing" :mass-action="massAction" />

    <import-validation-status-processing v-else-if="processing && lastRunMetadata" :mass-action="massAction" />

    <import-validation-status-pre-processed
      v-else-if="lastRunMetadata && preProcessed"
      :mass-action="massAction"
      :last-run-metadata="lastRunMetadata" />

    <import-validation-status-processed
      v-else-if="lastRunMetadata && processed"
      :mass-action="massAction"
      :last-run-metadata="lastRunMetadata" />

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
import { RcPageContent } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import mixins from 'vue-typed-mixins';
import routes from '@/constants/routes';

import ImportValidationStatusProcessing from './ImportValidationStatusProcessing.vue';
import ImportValidationStatusPreProcessing from './ImportValidationStatusPreProcessing.vue';
import ImportValidationStatusPreProcessed from '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusPreProcessed.vue';
import ImportValidationStatusProcessed from '@/ui/views/pages/mass-actions/import-validation-status/ImportValidationStatusProcessed.vue';
import massActionDetails from '@/ui/views/pages/mass-actions/mixins/massActionDetails';

export default mixins(massActionDetails).extend({
  name: 'ImportValidationStatusDetails',

  components: {
    ImportValidationStatusPreProcessed,
    RcPageContent,
    ImportValidationStatusPreProcessing,
    ImportValidationStatusProcessing,
    ImportValidationStatusProcessed,
  },

  computed: {
    title(): TranslateResult {
      if (this.preProcessing) return this.$t('massActions.impactValidation.status.preprocessing.title');
      if (this.processing) return this.$t('massActions.impactValidation.status.processing.title');
      return this.$t('massActions.impactValidation.status.details.title');
    },
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },
  },
});
</script>
