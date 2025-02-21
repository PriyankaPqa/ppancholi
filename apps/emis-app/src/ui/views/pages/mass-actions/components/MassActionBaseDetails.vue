<template>
  <rc-page-content :title="title">
    <mass-action-pre-processing-base
      v-if="preProcessing"
      :mass-action="massAction"
      :mass-action-metadata="massActionMetadata"
      :process-title="massActionBaseDetailsLabels.preProcessingWaitTitle"
      :process-label-one="massActionBaseDetailsLabels.preProcessingWaitLabelOne"
      :process-label-two="massActionBaseDetailsLabels.preProcessingWaitLabelTwo">
      <template #default>
        <slot name="pre-processing" />
      </template>
    </mass-action-pre-processing-base>

    <mass-action-processing-base
      v-else-if="processing && lastRunMetadata"
      :mass-action-status="MassActionRunStatus.Processing"
      :mass-action="massAction"
      :mass-action-metadata="massActionMetadata"
      :process-title="massActionBaseDetailsLabels.processingWaitTitle"
      :process-label-one="massActionBaseDetailsLabels.processingWaitLabelOne"
      :process-label-two="massActionBaseDetailsLabels.processingWaitLabelTwo" />

    <mass-action-pre-processed-processed-base
      v-else-if="lastRunMetadata && preProcessed"
      :mass-action-status="MassActionRunStatus.PreProcessed"
      :mass-action="massAction"
      :mass-action-metadata="massActionMetadata"
      :total="lastRunResults.total"
      :successes="lastRunResults.successes"
      :successes-amount="lastRunMetadata.totalAmount"
      :projected-amount="lastRunMetadata.projectedAmount"
      :failures="lastRunMetadata.results.failures"
      :total-label="massActionBaseDetailsLabels.preProcessedTotalLabel"
      :successes-label="massActionBaseDetailsLabels.preProcessedSuccessesLabel"
      :failures-label="massActionBaseDetailsLabels.preProcessedFailuresLabel"
      :disable-name="disableName"
      show-invalid-download-button
      show-process-button
      show-delete-icon
      show-edit-icon
      @delete:success="back()">
      <template #payment-details>
        <slot name="pre-processed" />
      </template>
    </mass-action-pre-processed-processed-base>

    <mass-action-pre-processed-processed-base
      v-else-if="lastRunMetadata && processed"
      :mass-action-status="MassActionRunStatus.Processed"
      :mass-action="massAction"
      :mass-action-metadata="massActionMetadata"
      :total="lastRunResults.total"
      :successes="lastRunResults.successes"
      :successes-amount="lastRunMetadata.totalAmount"
      :projected-amount="lastRunMetadata.projectedAmount"
      :failures="lastRunMetadata.results.failures"
      :total-label="massActionBaseDetailsLabels.processedTotalLabel"
      :successes-label="massActionBaseDetailsLabels.processedSuccessesLabel"
      :failures-label="massActionBaseDetailsLabels.processedFailuresLabel"
      :show-valid-download-button="showValidDownload"
      show-invalid-download-button>
      <template #payment-details>
        <slot name="processed" />
      </template>
    </mass-action-pre-processed-processed-base>

    <mass-action-failed-base
      v-else-if="failedPreProcessing"
      :mass-action-status="MassActionRunStatus.FailedPreProcessing"
      :mass-action="massAction"
      @delete:success="back()">
      <template #payment-details>
        <slot name="pre-processed" />
      </template>
    </mass-action-failed-base>

    <mass-action-failed-base
      v-else-if="failedProcessing"
      :mass-action-status="MassActionRunStatus.FailedProcessing"
      :mass-action="massAction">
      <template #payment-details>
        <slot name="processed" />
      </template>
    </mass-action-failed-base>

    <template #actions>
      <v-btn color="primary" data-test="back_to_mass_action_list_button" @click="back()">
        {{ $t('massActions.backToList.label') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import mixins from 'vue-typed-mixins';
import MassActionFailedBase from '@/ui/views/pages/mass-actions/components/MassActionFailedBase.vue';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import MassActionPreProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessingBase.vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import massActionDetails from '@/ui/views/pages/mass-actions/mixins/massActionDetails';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';

export interface IMassActionBaseDetailsLabels {
  preProcessingWaitTitle: string;
  preProcessingWaitLabelOne: string;
  preProcessingWaitLabelTwo: string;
  processingWaitTitle: string;
  processingWaitLabelOne: string;
  processingWaitLabelTwo: string;
  preProcessedTotalLabel: string;
  preProcessedSuccessesLabel: string;
  preProcessedFailuresLabel: string;
  processedTotalLabel: string;
  processedSuccessesLabel: string;
  processedFailuresLabel: string;
}

export default mixins(massActionDetails).extend({
  name: 'MassActionBaseDetails',

  components: {
    MassActionFailedBase,
    MassActionProcessingBase,
    MassActionPreProcessingBase,
    MassActionPreProcessedProcessedBase,
    RcPageContent,
  },

  props: {
    preProcessingTitle: {
      type: String,
      required: true,
    },

    processingTitle: {
      type: String,
      required: true,
    },

    detailsTitle: {
      type: String,
      required: true,
    },

    massActionBaseDetailsLabels: {
      type: Object as () => IMassActionBaseDetailsLabels,
      default: () => ({
        preProcessingWaitTitle: '',
        preProcessingWaitLabelOne: 'massActions.preProcessing.info1',
        preProcessingWaitLabelTwo: 'massActions.preProcessing.info2',
        processingWaitTitle: 'massActions.processing.files',
        processingWaitLabelOne: 'massActions.processing.info1',
        processingWaitLabelTwo: 'massActions.processing.info2',
        preProcessedTotalLabel: 'massAction.pre_processed.title.1',
        preProcessedSuccessesLabel: 'massAction.pre_processed.title.2',
        preProcessedFailuresLabel: 'massAction.pre_processed.title.3',
        processedTotalLabel: 'massAction.processed.title.1',
        processedSuccessesLabel: 'massAction.processed.title.2',
        processedFailuresLabel: 'massAction.processed.title.3',
      }),
    },

    backRouteName: {
      type: String,
      required: true,
    },

    showValidDownload: {
      type: Boolean,
      default: false,
    },

    disableName: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      MassActionRunStatus,
    };
  },

  computed: {
    title(): TranslateResult {
      if (this.preProcessing) {
        return this.$t(this.preProcessingTitle);
      }
      if (this.processing) {
        return this.$t(this.processingTitle);
      }
      return this.$t(this.detailsTitle);
    },
  },

  methods: {
    back() {
      this.$router.replace({ name: this.backRouteName });
    },
  },
});
</script>
