<template>
  <mass-action-base-details
    disable-name
    pre-processing-title="massActions.dataCorrection.status.preprocessing.title"
    processing-title="massActions.dataCorrection.status.processing.title"
    details-title="massActions.dataCorrection.status.details.title"
    :mass-action-base-details-labels="massActionBaseDetailsLabels"
    :back-route-name="routes.massActions.dataCorrection.home.name" />
</template>

<script lang="ts">
import routes from '@/constants/routes';
import MassActionBaseDetails, { IMassActionBaseDetailsLabels } from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import mixins from 'vue-typed-mixins';
import { MassActionDataCorrectionType } from '@/entities/mass-action';
import massActionDetails from '../mixins/massActionDetails';

export default mixins(massActionDetails).extend({
  name: 'DataCorrectionDetails',
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
      switch (this.massAction.entity.type as MassActionDataCorrectionType) {
        case MassActionDataCorrectionType.HomeAddress:
        default:
          return {
            preProcessingWaitTitle: '',
            preProcessingWaitLabelOne: 'massActions.preProcessing.info1',
            preProcessingWaitLabelTwo: 'massActions.homeAddress.preProcessing.info2',
            processingWaitTitle: 'massActions.homeAddress.processing.files',
            processingWaitLabelOne: 'massActions.homeAddress.processing.info1',
            processingWaitLabelTwo: 'massActions.homeAddress.processing.info2',
            preProcessedTotalLabel: 'massAction.homeAddress.pre_processed.title.1',
            preProcessedSuccessesLabel: 'massAction.pre_processed.title.2',
            preProcessedFailuresLabel: 'massAction.pre_processed.title.3',
            processedTotalLabel: 'massAction.homeAddress.processed.title.1',
            processedSuccessesLabel: 'massAction.processed.title.2',
            processedFailuresLabel: 'massAction.processed.title.3',
          };
      }
    },

  },
});
</script>
