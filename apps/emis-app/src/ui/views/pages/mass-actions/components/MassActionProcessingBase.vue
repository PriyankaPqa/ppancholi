<template>
  <v-row justify="center" class="pt-12">
    <v-col cols="12" md="8" xl="7" sm="12">
      <mass-action-title-description :mass-action="massAction" :mass-action-status="massActionStatus" />

      <div class="border my-7">
        <v-row justify="center" class="py-16">
          <v-col cols="12" md="8" xl="7" sm="12" class="center">
            <div class="process_container">
              <div class="mb-6">
                <v-progress-circular indeterminate :size="55" :width="6" color="primary" />
              </div>

              <div v-if="processTitle" class="rc-body14 fw-bold" data-test="processTitle">
                {{ $t(processTitle, { x: massAction.metadata.lastRun.results && massAction.metadata.lastRun.results.successes }) }}
              </div>

              <div class="rc-body12" data-test="processLabelOne">
                {{ $t(processLabelOne) }}
              </div>

              <div class="rc-body12" data-test="processLabelTwo">
                {{ $t(processLabelTwo) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <slot name="preprocessing" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMassActionCombined } from '@/entities/mass-action';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';

export default Vue.extend({
  name: 'MassActionProcessingBase',
  components: {
    MassActionTitleDescription,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    processTitle: {
      type: String,
      default: 'massActions.processing.files',
    },

    processLabelOne: {
      type: String,
      default: 'massActions.processing.info1',
    },

    processLabelTwo: {
      type: String,
      default: 'massActions.processing.info2',
    },

    massActionStatus: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>

.border {
  border-radius: 4px;
  border: 1px solid var(--v-grey-lighten2);
}

.process_container {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

</style>
