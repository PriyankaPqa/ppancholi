<template>
  <mass-action-base-details
    pre-processing-title="massActions.importUsers.status.preprocessing.title"
    processing-title="massActions.importUsers.status.processing.title"
    details-title="massActions.importUsers.status.details.title"
    :mass-action-base-details-labels="massActionBaseDetailsLabels"
    :back-route-name="routes.massActions.importUsers.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails, { IMassActionBaseDetailsLabels } from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'ImportUsersDetails',

  components: {
    MassActionBaseDetails,
  },

  data() {
    return {
      routes,
    };
  },

  computed: {
    massActionBaseDetailsLabels(): IMassActionBaseDetailsLabels {
      return ({
        preProcessingWaitTitle: '',
        preProcessingWaitLabelOne: 'massActions.importUsers.preProcessing.info1',
        preProcessingWaitLabelTwo: 'massActions.importUsers.preProcessing.info2',
        processingWaitTitle: 'massActions.importUsers.processing.accounts',
        processingWaitLabelOne: 'massActions.importUsers.processing.info1',
        processingWaitLabelTwo: 'massActions.importUsers.processing.info2',
        preProcessedTotalLabel: 'massAction.importUsers.pre_processed.title.1',
        preProcessedSuccessesLabel: 'massAction.importUsers.pre_processed.title.2',
        preProcessedFailuresLabel: 'massAction.importUsers.pre_processed.title.3',
        processedTotalLabel: 'massAction.importUsers.processed.title.1',
        processedSuccessesLabel: 'massAction.importUsers.processed.title.2',
        processedFailuresLabel: 'massAction.importUsers.processed.title.3',
      });
    },
  },
});
</script>
