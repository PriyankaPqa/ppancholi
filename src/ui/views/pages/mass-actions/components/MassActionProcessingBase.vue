<template>
  <v-row justify="center" class="pt-12">
    <v-col cols="12" md="8" xl="7" sm="12">
      <div class="title">
        <span class="rc-heading-5 fw-bold"> {{ massAction.entity.name }}</span>
        <status-chip show-loading status-name="MassActionRunStatus" :status="massActionStatus" />
      </div>

      <div v-if="massAction.entity.description" class="rc-body14 mt-4" data-test="description">
        {{ massAction.entity.description }}
      </div>

      <div class="border my-7">
        <v-row justify="center" class="py-16">
          <v-col cols="12" md="8" xl="7" sm="12" class="center">
            <div class="process_container">
              <div class="mb-6">
                <v-progress-circular indeterminate :size="55" :width="6" color="primary" />
              </div>

              <div v-if="processTitle" class="rc-body14 fw-bold" data-test="processTitle">
                {{ $t(processTitle, { x: massAction.metadata.lastRun.results.total }) }}
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
import colors from '@/ui/plugins/vuetify/colors';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'MassActionProcessingBase',
  components: {
    StatusChip,
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

  data() {
    return {
      colors,
    };
  },
});
</script>

<style lang="scss" scoped>

.title {
  display: flex;
  justify-content: space-between;
}

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
