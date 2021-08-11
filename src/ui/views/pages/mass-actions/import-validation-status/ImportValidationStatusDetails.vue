<template>
  <rc-page-content :title="title">
    <import-validation-status-pre-processing v-if="preProcessing" :mass-action="massAction" />

    <import-validation-status-processing v-if="processing" :number-item="900" :mass-action="massAction" />

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
import { IMassActionCombined, IMassActionRun, MassActionRunStatus } from '@/entities/mass-action';
import ImportValidationStatusProcessing from './components/ImportValidationStatusProcessing.vue';
import ImportValidationStatusPreProcessing from './components/ImportValidationStatusPreProcessing.vue';

export default Vue.extend({
  name: 'ImportValidationStatusDetails',

  components: {
    RcPageContent,
    ImportValidationStatusPreProcessing,
    ImportValidationStatusProcessing,
  },

  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },

    massAction(): IMassActionCombined {
      return this.$storage.massAction.getters.get(this.massActionId);
    },

    lastRun(): IMassActionRun {
      return _orderBy(this.massAction.entity.runs, 'timestamp', 'desc')[0];
    },

    preProcessing(): boolean {
      return this.lastRun?.runStatus === MassActionRunStatus.PreProcessing;
    },

    processing(): boolean {
      return this.lastRun?.runStatus === MassActionRunStatus.Processing;
    },

    title(): TranslateResult {
      if (this.preProcessing) return this.$t('massActions.impactValidation.status.preprocessing.title');
      if (this.processing) return this.$t('massActions.impactValidation.status.processing.title');
      return '';
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
