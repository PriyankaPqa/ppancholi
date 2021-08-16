<template>
  <v-row justify="center" class="pt-12">
    <v-col cols="12" md="8" xl="7" sm="12">
      <mass-action-title-description
        v-if="!editMode"
        :show-delete-icon="showDeleteIcon"
        :show-edit-icon="showEditIcon"
        :loading-chip="false"
        :mass-action="massAction"
        :mass-action-status="massActionStatus"
        @edit="editMode = true" />

      <mass-action-edit-title-description
        v-else
        :mass-action="massAction"
        :mass-action-status="massActionStatus"
        @cancel="editMode = false"
        @update="update($event)" />

      <div class="mt-12">
        <v-row no-gutters class="row-data">
          <v-col cols="12" md="5">
            <span class="rc-body14 fw-bold" data-test="totalLabel">{{ $t(totalLabel) }}</span>
          </v-col>
          <v-col md="7">
            <span class="rc-body14" data-test="total">{{ total }}</span>
          </v-col>
        </v-row>

        <v-row no-gutters :class="[isPreprocessed ? 'green-background': '', 'row-data']">
          <v-col cols="12" md="5">
            <span class="rc-body14 fw-bold green-text" data-test="successesLabel=">
              <v-icon class="mr-2" small :color="colors.status.success">mdi-check-circle</v-icon>
              {{ $t(successesLabel) }}
            </span>
          </v-col>
          <v-col md="5">
            <span class="rc-body14" data-test="successes">{{ successes }}</span>
          </v-col>
          <v-col md="2" class="d-flex justify-end">
            <v-btn v-if="showProcessButton" data-test="processButton" small color="primary" @click="$emit('process')">
              {{ $t('massAction.process.button.label') }}
            </v-btn>
          </v-col>
        </v-row>

        <v-row no-gutters :class="[isPreprocessed ? 'red-background': '', 'row-data']">
          <v-row no-gutters :class="[showErrors ? 'mt-4': '', 'full-width']">
            <v-col cols="12" md="5">
              <span class="rc-body14 fw-bold red-text">
                <v-icon class="mr-2" small :color="colors.status.error">mdi-alert-circle</v-icon>
                {{ $t(failuresLabel) }}
              </span>
            </v-col>
            <v-col md="5">
              <span class="rc-body14" data-test="failures">
                {{ failures }}
              </span>
            </v-col>
            <v-col md="2" class="d-flex justify-end">
              <template v-if="hasErrors">
                <v-btn icon class="mr-2" small @click="showErrors = !showErrors">
                  <v-icon>{{ showErrors ? 'mdi-chevron-up': 'mdi-chevron-down' }}</v-icon>
                </v-btn>

                <v-divider vertical class="mr-5" />
              </template>

              <v-btn v-if="showDownloadButton" data-test="downloadButton" :disabled="!hasFailures" small color="primary" @click="$emit('download')">
                {{ $t('massAction.download.button.label') }}
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="showErrors" class="full-width">
            <v-row v-for="(item, index) in massAction.metadata.lastRun.errors" :key="index" no-gutters>
              <v-col cols="12" md="5" class="ml-7 mb-2">
                <span class="rc-body14">{{ $t(`errors.${item.error}`) }}</span>
              </v-col>
              <v-col class="ml-n7">
                <span class="rc-body14">{{ $t(item.total) }}</span>
              </v-col>
            </v-row>
          </div>
        </v-row>
      </div>

      <mass-action-details-table :mass-action="massAction" :mass-action-type="massActionType" class="mt-12" />

      <slot name="preprocessing" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMassActionCombined, MassActionRunStatus } from '@/entities/mass-action';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import colors from '@/ui/plugins/vuetify/colors';

import MassActionEditTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionEditTitleDescription.vue';

export default Vue.extend({
  name: 'MassActionPreProcessedProcessedBase',
  components: {
    MassActionDetailsTable,
    MassActionTitleDescription,
    MassActionEditTitleDescription,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    massActionStatus: {
      type: Number,
      required: true,
    },

    massActionType: {
      type: String,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    successes: {
      type: Number,
      required: true,
    },

    failures: {
      type: Number,
      required: true,
    },

    totalLabel: {
      type: String,
      required: true,
    },

    successesLabel: {
      type: String,
      required: true,
    },

    failuresLabel: {
      type: String,
      required: true,
    },

    showProcessButton: {
      type: Boolean,
      default: false,
    },

    showDownloadButton: {
      type: Boolean,
      default: false,
    },

    showDeleteIcon: {
      type: Boolean,
      default: false,
    },

    showEditIcon: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      colors,
      showErrors: false,
      editMode: false,
    };
  },

  computed: {
    hasErrors(): boolean {
      return this.massAction.metadata.lastRun.errors.length > 0;
    },

    hasFailures(): boolean {
      return this.massAction.metadata.lastRun.results.failures > 0;
    },

    isPreprocessed(): boolean {
      return this.massAction.metadata.lastRun.runStatus === MassActionRunStatus.PreProcessed;
    },
  },

  mounted() {
    this.showErrors = !this.isPreprocessed;
  },

  methods: {
    update(payload: {name: string; description: string}) {
      this.editMode = false;
      this.$emit('update', payload);
    },
  },
});
</script>

<style lang="scss" scoped>

.green-text {
  color: var(--v-status_success-base);
}

.red-text {
  color:  var(--v-status_error-base);
}

.green-background {
  background: var(--v-status_green_pale-base);
}

.red-background {
  background: var(--v-status_red_pale-base);
}

.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;

}
.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-width: 1px 1px 1px 1px;
}
.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-width: 1px 1px 0px 1px;
}

.row-data:only-child {
  border-width: 1px 1px 1px 1px;
}

</style>
