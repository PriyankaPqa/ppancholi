<template>
  <div>
    <mass-action-processing-base
      :mass-action="massAction"
      :mass-action-status="MassActionRunStatus.PreProcessing"
      :process-title="processTitle"
      :process-label-one="processLabelOne"
      :process-label-two="processLabelTwo">
      <template #preprocessing>
        <mass-action-details-table :mass-action="massAction" :mass-action-type="massActionType" />
      </template>
    </mass-action-processing-base>
    <v-row justify="center" class="pt-12">
      <v-col cols="12" md="8" xl="7" sm="12">
        <!--    Use this slot to add more -->
        <slot />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMassActionCombined, MassActionRunStatus, MassActionType } from '@/entities/mass-action';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';

export default Vue.extend({
  name: 'MassActionPreProcessingBase',
  components: {
    MassActionDetailsTable,
    MassActionProcessingBase,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    processTitle: {
      type: String,
      default: '',
    },

    processLabelOne: {
      type: String,
      default: 'massActions.preProcessing.info1',
    },

    processLabelTwo: {
      type: String,
      default: 'massActions.preProcessing.info2',
    },

    massActionType: {
      type: Number as () => MassActionType,
      required: true,
    },
  },

  data() {
    return {
      MassActionRunStatus,
    };
  },

});
</script>
