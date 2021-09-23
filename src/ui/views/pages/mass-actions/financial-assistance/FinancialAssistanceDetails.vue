<template>
  <rc-page-content :title="title">
    <financial-assistance-pre-processing v-if="preProcessing" :mass-action="massAction" />

    <financial-assistance-processing v-else-if="processing && lastRunMetadata" :mass-action="massAction" />

    <financial-assistance-pre-processed
      v-else-if="lastRunMetadata && preProcessed"
      :mass-action="massAction"
      :last-run-metadata="lastRunMetadata" />

    <financial-assistance-processed
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
import { TranslateResult } from 'vue-i18n';
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@crctech/component-library';
import FinancialAssistancePreProcessing from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePreProcessing.vue';
import massActionDetails from '@/ui/views/pages/mass-actions/mixins/massActionDetails';
import routes from '@/constants/routes';
import FinancialAssistanceProcessing from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceProcessing.vue';
import FinancialAssistancePreProcessed from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePreProcessed.vue';
import FinancialAssistanceProcessed from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceProcessed.vue';

export default mixins(massActionDetails).extend({
  name: 'FinancialAssistanceDetails',
  components: {
    RcPageContent,
    FinancialAssistancePreProcessed,
    FinancialAssistanceProcessing,
    FinancialAssistancePreProcessing,
    FinancialAssistanceProcessed,
  },

  computed: {
    title(): TranslateResult {
      if (this.preProcessing) return this.$t('massActions.financialAssistance.status.preprocessing.title');
      if (this.processing) return this.$t('massActions.financialAssistance.status.processing.title');
      return this.$t('massActions.financialAssistance.status.details.title');
    },
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.financialAssistance.home.name });
    },
  },
});
</script>
